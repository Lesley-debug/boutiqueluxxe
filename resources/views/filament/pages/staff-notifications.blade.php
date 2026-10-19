<x-filament-panels::page>
<x-filament::section heading="Your notification inbox">
<p style="color:#57534e;line-height:1.6">Only notifications addressed to your account appear here. {{ $unreadCount }} unread. Reading an alert does not change an order, send an email or delete the alert.</p>
<label for="staff-notification-status" style="display:block;margin-top:1rem">Show</label>
<select id="staff-notification-status" wire:model.live="status" style="padding:.75rem;border:1px solid #d6d3d1;border-radius:.6rem;max-width:100%;margin:.4rem 0 1rem">
<option value="unread">Unread</option><option value="read">Read</option><option value="all">All my notifications</option>
</select>
@forelse($notifications as $notification)
@php($card=$cards[$notification->id])
<article wire:key="staff-notification-{{ $notification->id }}" style="border:1px solid #e7e5e4;border-radius:.8rem;padding:1rem;margin-bottom:.8rem;overflow-wrap:anywhere;background:{{ $notification->read_at ? '#fafaf9' : '#fffbeb' }}">
<p style="font-size:.8rem;color:#78716c">{{ $notification->read_at ? 'Read' : 'Unread' }} · {{ $notification->created_at?->format('d M Y H:i') }}</p>
<h2 style="font-weight:600;margin:.3rem 0">{{ $card['title'] }}</h2>
<p style="white-space:pre-line;line-height:1.6">{{ $card['message'] }}</p>
<div style="display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;margin-top:.8rem">
@if(!$notification->read_at)<x-filament::button color="gray" wire:click="markRead(@js($notification->id))" wire:loading.attr="disabled" wire:target="markRead">Mark read</x-filament::button>@endif
@if($card['url'])<a href="{{ $card['url'] }}" style="text-decoration:underline">Open related record</a>@endif
</div>
</article>
@empty<p style="padding:1rem 0;color:#78716c">No notifications in this view.</p>@endforelse
{{ $notifications->links() }}
</x-filament::section>
</x-filament-panels::page>
