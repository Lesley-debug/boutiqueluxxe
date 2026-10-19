<x-filament-panels::page>
<x-filament::section heading="Customer checkout contacts">
<p style="color:#777">Grouped by checkout email, not proof of a verified account identity. Read-only: no password, role or account editing. Totals are order values, not revenue.</p>
<input aria-label="Search checkout contacts" wire:model.live.debounce.400ms="search" placeholder="Search name or email" maxlength="120" style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;margin:16px 0">
@foreach($customers as $customer)
<div style="padding:12px 0;border-top:1px solid #ddd;overflow-wrap:anywhere">
<strong>{{ $customer->email_key }}</strong><p>{{ $customer->orders_count }} orders · USD {{ number_format((float)$customer->order_value,2) }} total order value</p>
<x-filament::button color="gray" wire:click="selectEmail('{{ base64_encode($customer->email_key) }}')">View history</x-filament::button>
</div>
@endforeach
{{ $customers->links() }}
</x-filament::section>
@if($profile)
<x-filament::section heading="Read-only customer history">
<h2>{{ $profile->customer_name }}</h2><p>{{ $profile->customer_email }} · {{ $profile->customer_phone }}</p>
<p>{{ $summary->orders_count }} orders · USD {{ number_format((float)$summary->order_value,2) }} total order value (all states)</p>
<p>USD {{ number_format((float)$summary->marked_paid_value,2) }} marked-paid, non-cancelled order value — not revenue or verified settlement</p>
@foreach($orders as $order)
<div style="padding:12px 0;border-top:1px solid #ddd;overflow-wrap:anywhere">
<strong>{{ $order->order_number }}</strong> · {{ $order->status }} · {{ $order->payment_status }}
<p>USD {{ number_format((float)$order->total,2) }} · {{ $order->created_at->format('d M Y H:i') }}</p>
@if(\App\Support\StaffWorkspaceAccess::allows(auth('web')->user(),'orders.manage'))<a href="{{ \App\Filament\Resources\Orders\OrderResource::getUrl('view',['record'=>$order],panel:'staff') }}">View order</a>@endif
</div>
@endforeach
{{ $orders->links() }}
</x-filament::section>
@elseif($selectedEmail)<p>No checkout history found for this email.</p>@endif
</x-filament-panels::page>
