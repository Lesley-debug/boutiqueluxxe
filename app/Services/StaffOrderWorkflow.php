<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderWorkflowEvent;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class StaffOrderWorkflow
{
    public static function statusOptions(Order $order): array
    {
        $labels = ['processing' => 'Confirm / process', 'shipped' => 'Mark shipped', 'delivered' => $order->fulfillment_method === 'pickup' ? 'Mark collected' : 'Mark delivered', 'cancelled' => 'Cancel and release reserved stock'];
        $allowed = match ($order->status) {
            'pending' => ['processing', 'cancelled'],
            'processing' => $order->fulfillment_method === 'pickup' ? ['delivered', 'cancelled'] : ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            default => [],
        };
        if ($order->payment_status === 'paid') { $allowed = array_diff($allowed, ['cancelled']); }
        return array_intersect_key($labels, array_flip($allowed));
    }

    private function event(User $actor, Order $order, string $kind, ?string $from, ?string $to, ?string $note, array $metadata = []): OrderWorkflowEvent
    {
        $event = OrderWorkflowEvent::create([
            'order_id' => $order->id, 'actor_id' => $actor->id, 'actor_name' => $actor->fresh()->name,
            'kind' => $kind, 'from_value' => $from, 'to_value' => $to, 'note' => $note,
            'snapshot' => array_intersect_key($order->getAttributes(), array_flip(['id', 'order_number', 'user_id', 'customer_name', 'customer_email', 'status', 'payment_status', 'fulfillment_method'])),
            'metadata' => $metadata, 'email_status' => $kind === 'note' ? 'not_requested' : 'pending',
        ]);
        // Default remains automatic submission after commit. Tests may explicitly
        // hold submission so they can exercise pending, failed and interrupted states.
        if ($kind !== 'note' && config('orders.auto_submit_updates', true)) {
            DB::afterCommit(function () use ($order): void {
                try { app(OrderUpdateDelivery::class)->drain($order->id); }
                catch (\Throwable $exception) { report($exception); }
            });
        }
        return $event;
    }

    public function changeStatus(User $actor, Order $order, string $target, string $expected, ?string $note = null): ?OrderWorkflowEvent
    {
        Gate::forUser($actor)->authorize('update', $order);
        Validator::make(['status' => $target, 'note' => $note], [
            'status' => ['required', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'note' => [$target === 'cancelled' ? 'required' : 'nullable', 'string', 'max:2000'],
        ])->validate();
        return DB::transaction(function () use ($actor, $order, $target, $expected, $note): ?OrderWorkflowEvent {
            $record = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            if ($record->status === $target) { return null; } // Safe repeat: no stock or email side effects.
            if ($record->status !== $expected) { throw ValidationException::withMessages(['status' => 'This order changed in another session. Reload before continuing.']); }
            if (! array_key_exists($target, self::statusOptions($record))) {
                throw ValidationException::withMessages(['status' => 'This transition is not allowed. Paid cancellations need financial review outside this workflow; no refund is performed here.']);
            }
            $from = $record->status; $metadata = [];
            if ($target === 'cancelled') {
                if ($record->stock_released_at) { throw ValidationException::withMessages(['status' => 'Stock has already been released. Review this inconsistent order before changing it.']); }
                $items = $record->items()->orderBy('id')->lockForUpdate()->get();
                if ($items->isEmpty()) { throw ValidationException::withMessages(['status' => 'No item snapshots exist. Review the order and inventory before cancellation.']); }
                $ids = $items->pluck('product_variant_id')->filter()->unique()->sort()->values();
                $variants = ProductVariant::query()->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
                $quantities = []; $missing = [];
                foreach ($items as $item) {
                    if ((int) $item->quantity <= 0) { throw ValidationException::withMessages(['status' => 'An order line has an invalid quantity. Review inventory first.']); }
                    if (! $item->product_variant_id || ! $variants->has($item->product_variant_id)) { $missing[] = $item->id; continue; }
                    $quantities[$item->product_variant_id] = ($quantities[$item->product_variant_id] ?? 0) + (int) $item->quantity;
                }
                foreach ($quantities as $id => $quantity) {
                    $variant = $variants[$id];
                    $newQuantity = $variant->stock_quantity + $quantity;
                    if ($newQuantity > 4294967295) { throw ValidationException::withMessages(['status' => 'Restocking would exceed the inventory column limit. Review inventory first.']); }
                    $variant->update(['stock_quantity' => $newQuantity]);
                }
                $record->stock_released_at = now();
                $metadata = ['restored_units' => array_sum($quantities), 'missing_item_ids' => $missing];
            }
            $record->status = $target; $record->save();
            return $this->event($actor, $record, 'status', $from, $target, $note, $metadata);
        });
    }

    public function recordPayment(User $actor, Order $order, string $target, string $expected, string $note): ?OrderWorkflowEvent
    {
        Gate::forUser($actor)->authorize('update', $order);
        Validator::make(['payment_status' => $target, 'note' => $note], ['payment_status' => ['required', Rule::in(['pending', 'paid'])], 'note' => ['required', 'string', 'min:3', 'max:2000']])->validate();
        return DB::transaction(function () use ($actor, $order, $target, $expected, $note): ?OrderWorkflowEvent {
            $record = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            if ($record->payment_status === $target) { return null; }
            if ($record->payment_status !== $expected) { throw ValidationException::withMessages(['payment_status' => 'The payment record changed. Reload before continuing.']); }
            if ($record->status === 'cancelled') { throw ValidationException::withMessages(['payment_status' => 'Cancelled orders require separate financial review. This action does not charge or refund money.']); }
            $from = $record->payment_status; $record->payment_status = $target; $record->save();
            return $this->event($actor, $record, 'payment', $from, $target, $note);
        });
    }

    public function addNote(User $actor, Order $order, string $note): OrderWorkflowEvent
    {
        Gate::forUser($actor)->authorize('update', $order);
        Validator::make(['note' => $note], ['note' => ['required', 'string', 'max:2000']])->validate();
        return DB::transaction(function () use ($actor, $order, $note): OrderWorkflowEvent {
            $record = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            return $this->event($actor, $record, 'note', null, null, $note);
        });
    }
}
