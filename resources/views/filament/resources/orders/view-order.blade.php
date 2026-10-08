<x-filament-panels::page>
    @php
        $order = $this->orderDetails();
        $history = $this->history();
        $currency = config('commerce.currency', 'USD');
        $money = fn ($amount) => $currency.' '.number_format((float) $amount, 2);
    @endphp
    <style>
        .bl-order-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:1rem; }
        .bl-order-text { overflow-wrap:anywhere; line-height:1.65; }
        .bl-order-muted { color:#78716c; font-size:.875rem; }
        .bl-order-dl { display:grid; grid-template-columns:minmax(0,1fr); gap:.6rem; }
        .bl-order-dl dt { color:#78716c; font-size:.875rem; }
        .bl-order-dl dd { margin:0; overflow-wrap:anywhere; }
        .bl-order-items { display:grid; gap:.75rem; }
        .bl-order-item { display:grid; gap:.4rem; border:1px solid #e7e5e4; border-radius:.75rem; padding:1rem; }
        .bl-order-history { border-left:3px solid #d97706; padding:.5rem 0 .5rem 1rem; margin-bottom:1rem; overflow-wrap:anywhere; }
        .bl-order-note { white-space:pre-wrap; }
        @media(min-width:768px) { .bl-order-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .bl-order-dl { grid-template-columns:minmax(0,1fr) minmax(0,1fr); } .bl-order-item { grid-template-columns:minmax(0,2fr) minmax(0,1fr); } }
    </style>
    <div class="bl-order-grid">
        <x-filament::section heading="Order overview">
            <dl class="bl-order-dl">
                <div><dt>Progress</dt><dd>{{ ucfirst($order->status) }}</dd></div>
                <div><dt>Payment record</dt><dd>{{ $order->payment_status === 'paid' ? 'Marked paid by staff' : 'Payment pending' }}</dd></div>
                <div><dt>Fulfillment</dt><dd>{{ ucfirst($order->fulfillment_method) }}</dd></div>
                <div><dt>Placed</dt><dd>{{ $order->created_at->format('d M Y H:i') }}</dd></div>
                <div><dt>Total</dt><dd><strong>{{ $money($order->total) }}</strong></dd></div>
                <div><dt>Stock release</dt><dd>{{ $order->stock_released_at ? $order->stock_released_at->format('d M Y H:i') : ($order->status === 'cancelled' ? 'Legacy cancellation — no release recorded by this workflow' : 'Not released') }}</dd></div>
            </dl>
            <p class="bl-order-muted" style="margin-top:1rem">Payment is recorded manually. No automatic charge or refund is performed. Times use the application timezone.</p>
        </x-filament::section>
        <x-filament::section heading="Customer & delivery">
            <div class="bl-order-text">
                <strong>{{ $order->customer_name }}</strong><br>
                {{ $order->customer_email }}<br>
                {{ $order->customer_phone ?: 'No phone supplied' }}
                @if ($order->fulfillment_method === 'delivery')
                    <p style="margin-top:.75rem">{{ $order->shipping_address }}<br>{{ $order->city }}{{ $order->region ? ', '.$order->region : '' }}</p>
                @else
                    <p style="margin-top:.75rem">Pickup — coordinate collection with the customer.</p>
                @endif
                @if ($order->payment_reference)
                    <p style="margin-top:.75rem"><strong>Customer-supplied reference:</strong> {{ $order->payment_reference }}<br><span class="bl-order-muted">Not verified evidence of payment.</span></p>
                @endif
            </div>
        </x-filament::section>
    </div>
    <x-filament::section heading="Ordered items — preserved snapshots">
        <div class="bl-order-items">
            @forelse ($order->items as $item)
                <div class="bl-order-item">
                    <div class="bl-order-text"><strong>{{ $item->product_name }}</strong><br>{{ $item->variant_label ?: 'Standard option' }}<br><span class="bl-order-muted">SKU: {{ $item->sku ?: 'Not recorded' }}</span></div>
                    <div class="bl-order-text">{{ (int) $item->quantity }} × {{ $money($item->unit_price) }}<br><strong>{{ $money($item->line_total) }}</strong></div>
                </div>
            @empty
                <p class="bl-order-muted">No item snapshots are recorded. Review this order before taking action.</p>
            @endforelse
        </div>
        <dl class="bl-order-dl" style="margin-top:1rem">
            <div><dt>Subtotal</dt><dd>{{ $money($order->subtotal) }}</dd></div>
            <div><dt>Delivery</dt><dd>{{ $money($order->shipping_cost) }}</dd></div>
            <div><dt>Discount {{ $order->discount_code ? '('.$order->discount_code.')' : '' }}</dt><dd>{{ $money($order->discount_amount ?? 0) }}</dd></div>
            <div><dt>Total</dt><dd><strong>{{ $money($order->total) }}</strong></dd></div>
        </dl>
    </x-filament::section>
    @if ($order->notes)
        <x-filament::section heading="Original customer note">
            <p class="bl-order-text bl-order-note">{{ $order->notes }}</p>
        </x-filament::section>
    @endif
    <x-filament::section heading="Staff history & notification attempts">
        <p class="bl-order-muted" style="margin-bottom:1rem">Latest 50 workflow entries. Private notes are never included in customer emails. “Sent” means accepted by the mail service, not confirmed inbox delivery.</p>
        @forelse ($history as $event)
            <div class="bl-order-history bl-order-text">
                <strong>{{ ucfirst($event->kind) }}{{ $event->to_value ? ': '.ucfirst($event->from_value ?? '').' → '.ucfirst($event->to_value) : '' }}</strong><br>
                <span class="bl-order-muted">{{ $event->created_at->format('d M Y H:i') }} · {{ $event->actor_name }}</span>
                @if ($event->note)<p class="bl-order-note">{{ $event->note }}</p>@endif
                @if (isset($event->metadata['restored_units']))<p>Inventory released: {{ $event->metadata['restored_units'] }} units.</p>@endif
                @if (! empty($event->metadata['missing_item_ids']))<p><strong>Inventory review required:</strong> {{ count($event->metadata['missing_item_ids']) }} historical item lines have no remaining variant and could not be restocked.</p>@endif
                @if ($event->email_status !== 'not_requested')
                    <p>Email: {{ ucfirst($event->email_status) }} · {{ $event->email_attempts }} attempts{{ $event->email_sent_at ? ' · '.$event->email_sent_at->format('d M Y H:i') : '' }}</p>
                    @if ($event->email_error)<p class="bl-order-muted">{{ $event->email_error }}</p>@endif
                @endif
                @if (! empty($event->metadata['send_recovery']))<p class="bl-order-muted">Interrupted-send review by {{ $event->metadata['send_recovery']['actor_name'] }}: {{ $event->metadata['send_recovery']['note'] }}</p>@endif
            </div>
        @empty
            <p class="bl-order-muted">No staff workflow entries yet. Historical order states were not rewritten during migration.</p>
        @endforelse
    </x-filament::section>
</x-filament-panels::page>
