<?php

namespace App\Services;

use App\Mail\OrderPaymentRecordedMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\Order;
use App\Models\OrderWorkflowEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

final class OrderUpdateDelivery
{
    public function drain(int $orderId, int $limit = 20): void
    {
        for ($i = 0; $i < $limit; $i++) {
            $event = OrderWorkflowEvent::where('order_id', $orderId)->where('email_status', 'pending')->orderBy('id')->first();
            if (! $event || ! $this->send($event->id)) { break; }
        }
    }

    public function send(int $eventId): bool
    {
        $original = OrderWorkflowEvent::findOrFail($eventId);
        $event = DB::transaction(function () use ($original): ?OrderWorkflowEvent {
            Order::query()->whereKey($original->order_id)->lockForUpdate()->firstOrFail();
            $event = OrderWorkflowEvent::query()->whereKey($original->id)->lockForUpdate()->firstOrFail();
            if (! in_array($event->email_status, ['pending', 'failed'], true)) { return null; }
            if (OrderWorkflowEvent::where('order_id', $event->order_id)->where('email_status', 'sending')->exists()) { return null; }
            if (OrderWorkflowEvent::where('order_id', $event->order_id)->where('id', '<', $event->id)->where('email_status', 'pending')->exists()) { return null; }
            if (OrderWorkflowEvent::where('order_id', $event->order_id)->where('id', '>', $event->id)->where('email_status', 'sent')->exists()) {
                throw ValidationException::withMessages(['event_id' => 'A newer update has already been sent. Retrying this old notice could mislead the customer.']);
            }
            $event->update(['email_status' => 'sending', 'email_claimed_at' => now(), 'email_attempts' => $event->email_attempts + 1, 'email_error' => null]);
            return $event;
        });
        if (! $event) { return false; }
        try {
            $snapshot = new Order;
            $snapshot->setRawAttributes($event->snapshot);
            $mail = $event->kind === 'payment' ? new OrderPaymentRecordedMail($snapshot) : new OrderStatusUpdatedMail($snapshot);
            Mail::to($snapshot->customer_email)->send($mail);
            OrderWorkflowEvent::whereKey($event->id)->where('email_status', 'sending')->where('email_attempts', $event->email_attempts)
                ->update(['email_status' => 'sent', 'email_sent_at' => now(), 'email_error' => null]);
            return true;
        } catch (\Throwable $exception) {
            report($exception);
            OrderWorkflowEvent::whereKey($event->id)->where('email_status', 'sending')->where('email_attempts', $event->email_attempts)
                ->update(['email_status' => 'failed', 'email_error' => 'Mail submission failed; consult private server mail logs.']);
            return false;
        }
    }

    public function retry(User $actor, Order $order, int $eventId): bool
    {
        Gate::forUser($actor)->authorize('update', $order);
        $event = OrderWorkflowEvent::where('order_id', $order->id)->whereKey($eventId)->firstOrFail();
        if (! in_array($event->email_status, ['pending', 'failed'], true)) {
            throw ValidationException::withMessages(['event_id' => 'Only pending or failed notices can be submitted again.']);
        }
        $sent = $this->send($event->id);
        if ($sent) { $this->drain($order->id); }
        return $sent;
    }

    public function recoverInterrupted(User $actor, Order $order, int $eventId, string $note): void
    {
        Gate::forUser($actor)->authorize('update', $order);
        Validator::make(['note' => $note], ['note' => ['required', 'string', 'min:3', 'max:2000']])->validate();
        DB::transaction(function () use ($actor, $order, $eventId, $note): void {
            Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $event = OrderWorkflowEvent::where('order_id', $order->id)->whereKey($eventId)->lockForUpdate()->firstOrFail();
            if ($event->email_status !== 'sending' || ! $event->email_claimed_at || $event->email_claimed_at->gt(now()->subMinutes(10))) {
                throw ValidationException::withMessages(['event_id' => 'Only a send interrupted for at least ten minutes can be marked for review.']);
            }
            $event->update(['email_status' => 'failed', 'email_error' => 'Interrupted send reviewed by staff; delivery may already have occurred.',
                'metadata' => [...($event->metadata ?? []), 'send_recovery' => ['actor_id' => $actor->id, 'actor_name' => $actor->fresh()->name, 'note' => $note, 'at' => now()->toIso8601String()]]]);
        });
    }
}
