<x-filament-panels::page>
<x-filament::section heading="Stored newsletter subscriptions">
<p style="color:#57534e;line-height:1.6">{{ $subscribedCount }} subscribed records · {{ $unsubscribedCount }} unsubscribed records. These records alone do not prove mailbox verification or marketing consent. This screen is read-only: no sending, export, deletion or resubscription.</p>
<div style="display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0">
<div style="flex:1;min-width:180px"><label for="staff-newsletter-search" style="display:block">Search email</label><input id="staff-newsletter-search" type="search" wire:model.live.debounce.400ms="search" maxlength="120" placeholder="Search stored email" style="width:100%;padding:.75rem;border:1px solid #d6d3d1;border-radius:.6rem;margin-top:.4rem"></div>
<div><label for="staff-newsletter-status" style="display:block">Show</label><select id="staff-newsletter-status" wire:model.live="status" style="padding:.75rem;border:1px solid #d6d3d1;border-radius:.6rem;max-width:100%;margin-top:.4rem"><option value="subscribed">Subscribed</option><option value="unsubscribed">Unsubscribed</option><option value="all">All stored records</option></select></div>
</div>
@forelse($subscribers as $subscriber)
<article wire:key="subscriber-{{ $subscriber->id }}" style="padding:1rem 0;border-top:1px solid #e7e5e4;overflow-wrap:anywhere">
<strong>{{ $subscriber->email }}</strong><p style="font-size:.85rem;color:#78716c">{{ $subscriber->unsubscribed_at ? 'Unsubscribed' : 'Subscribed record' }} · First stored {{ $subscriber->created_at?->format('d M Y H:i') }}</p>
@if($subscriber->unsubscribed_at)<p style="font-size:.85rem;color:#78716c">Unsubscribed {{ $subscriber->unsubscribed_at->format('d M Y H:i') }}</p>@endif
</article>
@empty<p style="padding:1rem 0;color:#78716c">No subscriptions match this view.</p>@endforelse
{{ $subscribers->links() }}
</x-filament::section>
</x-filament-panels::page>
