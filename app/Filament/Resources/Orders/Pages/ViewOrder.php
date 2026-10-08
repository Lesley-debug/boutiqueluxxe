<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use App\Models\OrderWorkflowEvent;
use App\Services\OrderUpdateDelivery;
use App\Services\StaffOrderWorkflow;
use Filament\Actions\Action;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Utilities\Get;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;
    protected string $view = 'filament.resources.orders.view-order';

    public function getTitle(): string { return 'Order '.$this->getRecord()->order_number; }

    public function orderDetails(): Order
    {
        Gate::authorize('view', $this->getRecord());
        return $this->getRecord()->fresh(['items']);
    }

    public function history(): Collection
    {
        Gate::authorize('view', $this->getRecord());
        return OrderWorkflowEvent::where('order_id', $this->getRecord()->id)->latest('id')->limit(50)->get();
    }

    private function runWorkflow(callable $operation): mixed
    {
        try { $result = $operation(); }
        catch (ValidationException $exception) {
            $prefix = $this->getMountedActionSchema()?->getStatePath();
            throw ValidationException::withMessages(collect($exception->errors())->mapWithKeys(fn ($errors, $key) => [($prefix ? $prefix.'.' : '').$key => $errors])->all());
        }
        $this->record = $this->getRecord()->fresh();
        return $result;
    }

    private function showResult(?OrderWorkflowEvent $event): void
    {
        if (! $event) { Notification::make()->title('Already up to date — no repeat change or email')->info()->send(); return; }
        $event = $event->fresh();
        $missing = count($event->metadata['missing_item_ids'] ?? []);
        if ($missing) {
            Notification::make()->title('Order cancelled — inventory review required')->body($missing.' historical item lines have no remaining variant and could not be restocked. See the audit history.')->warning()->send();
        } elseif (in_array($event->email_status, ['failed', 'pending', 'sending'], true)) {
            Notification::make()->title('Order saved — email needs attention')->body('The order change is saved. Check notification status in its history; mail failure does not undo the order change.')->warning()->send();
        } else { Notification::make()->title('Order update saved')->success()->send(); }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('changeStatus')->label('Update order progress')->color('primary')
                ->visible(fn (): bool => StaffOrderWorkflow::statusOptions($this->getRecord()->fresh()) !== [])
                ->fillForm(fn (): array => ['expected_status' => $this->getRecord()->fresh()->status])
                ->schema([
                    Hidden::make('expected_status'),
                    Select::make('status')->label('Next step')->required()->live()->options(fn (): array => StaffOrderWorkflow::statusOptions($this->getRecord()->fresh())),
                    Textarea::make('note')->label('Internal note / cancellation reason')->maxLength(2000)->required(fn (Get $get): bool => $get('status') === 'cancelled')->helperText('Private to staff. Cancellation releases reserved inventory once; shipped, delivered and paid orders cannot be cancelled here.'),
                ])->requiresConfirmation()->modalDescription('Confirm this order action. Customer emails contain the status update, not your internal note.')
                ->action(function (array $data): void {
                    $event = $this->runWorkflow(fn () => app(StaffOrderWorkflow::class)->changeStatus(auth('web')->user(), $this->getRecord(), $data['status'], $data['expected_status'], $data['note'] ?? null));
                    $this->showResult($event);
                }),
            Action::make('recordPayment')->label('Record / correct payment')->color('gray')->visible(fn (): bool => $this->getRecord()->fresh()->status !== 'cancelled')
                ->fillForm(fn (): array => ['expected_payment' => $this->getRecord()->fresh()->payment_status])
                ->schema([
                    Hidden::make('expected_payment'),
                    Select::make('payment_status')->required()->options(['paid' => 'Mark paid — staff verified receipt', 'pending' => 'Correct to pending — not a refund']),
                    Textarea::make('note')->label('Private evidence / correction reason')->required()->minLength(3)->maxLength(2000)->helperText('Record how payment was confirmed or why this record needs correction. Customer-entered references are not proof of payment.'),
                ])->requiresConfirmation()->modalDescription('This updates the manual order record only. It does not charge, transfer or refund money.')
                ->action(function (array $data): void {
                    $event = $this->runWorkflow(fn () => app(StaffOrderWorkflow::class)->recordPayment(auth('web')->user(), $this->getRecord(), $data['payment_status'], $data['expected_payment'], $data['note']));
                    $this->showResult($event);
                }),
            Action::make('addNote')->label('Add private note')->color('gray')->schema([Textarea::make('note')->required()->maxLength(2000)])
                ->action(function (array $data): void {
                    $this->runWorkflow(fn () => app(StaffOrderWorkflow::class)->addNote(auth('web')->user(), $this->getRecord(), $data['note']));
                    Notification::make()->title('Private note saved — no customer email')->success()->send();
                }),
            Action::make('retryEmail')->label('Submit pending / failed notice')->color('warning')
                ->visible(fn (): bool => OrderWorkflowEvent::where('order_id', $this->getRecord()->id)->whereIn('email_status', ['pending', 'failed'])->exists())
                ->schema([Select::make('event_id')->label('Notice')->required()->options(fn (): array => OrderWorkflowEvent::where('order_id', $this->getRecord()->id)->whereIn('email_status', ['pending', 'failed'])->orderBy('id')->get()->mapWithKeys(fn ($event) => [$event->id => '#'.$event->id.' '.$event->kind.' → '.$event->to_value.' ('.$event->email_status.')'])->all())])
                ->requiresConfirmation()->modalDescription('An SMTP timeout can occur after a message was accepted. Retrying may produce a duplicate. Older notices cannot be resent after a newer update was sent.')
                ->action(function (array $data): void {
                    $sent = $this->runWorkflow(fn () => app(OrderUpdateDelivery::class)->retry(auth('web')->user(), $this->getRecord(), (int) $data['event_id']));
                    if ($sent) { Notification::make()->title('Notice submitted to the mail service')->success()->send(); }
                    else { Notification::make()->title('Submission delayed or failed — review history')->warning()->send(); }
                }),
            Action::make('recoverEmail')->label('Review interrupted send')->color('gray')
                ->visible(fn (): bool => OrderWorkflowEvent::where('order_id', $this->getRecord()->id)->where('email_status', 'sending')->where('email_claimed_at', '<=', now()->subMinutes(10))->exists())
                ->schema([
                    Select::make('event_id')->required()->options(fn (): array => OrderWorkflowEvent::where('order_id', $this->getRecord()->id)->where('email_status', 'sending')->where('email_claimed_at', '<=', now()->subMinutes(10))->get()->mapWithKeys(fn ($event) => [$event->id => '#'.$event->id.' '.$event->kind.' → '.$event->to_value])->all()),
                    Textarea::make('note')->label('Review note')->required()->minLength(3)->maxLength(2000),
                ])->requiresConfirmation()->modalDescription('First review the server logs and confirm no send is still running. This marks an interrupted attempt as failed; it does not resend it. A later retry may duplicate a message already accepted by SMTP.')
                ->action(function (array $data): void {
                    $this->runWorkflow(fn () => app(OrderUpdateDelivery::class)->recoverInterrupted(auth('web')->user(), $this->getRecord(), (int) $data['event_id'], $data['note']));
                    Notification::make()->title('Interrupted send marked for review')->warning()->send();
                }),
        ];
    }
}
