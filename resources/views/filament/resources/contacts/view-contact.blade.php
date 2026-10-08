<x-filament-panels::page>
@php($thread = $this->details())
<x-filament::section heading="Original customer message — preserved">
<p><strong>{{ $thread->subject }}</strong> · {{ ucfirst($thread->status) }}</p>
<p>{{ $thread->name }} · {{ $thread->email }} · {{ $thread->created_at->format('d M Y H:i') }}</p>
<div style="white-space:pre-wrap;overflow-wrap:anywhere;margin-top:16px">{{ $thread->message }}</div>
</x-filament::section>
<x-filament::section heading="Staff history & mail submission">
<p style="color:#777">Latest 50 entries. Sent means accepted by the mail service, not confirmed inbox delivery. Private notes are never emailed. Replies arriving in your mailbox are not automatically imported here.</p>
@forelse($this->history() as $event)
<div style="border-top:1px solid #ddd;padding:16px 0;overflow-wrap:anywhere">
<strong>#{{ $event->id }} · {{ ucfirst($event->kind) }}</strong> · {{ $event->actor_name }} · {{ $event->created_at->format('d M Y H:i') }}
@if($event->body)<div style="white-space:pre-wrap;margin-top:8px">{{ $event->body }}</div>@endif
@if($event->email_status !== 'not_requested')<p>Mail: {{ $event->email_status }} · Attempts: {{ $event->email_attempts }} @if($event->email_sent_at) · Submitted {{ $event->email_sent_at->format('d M Y H:i') }} @endif</p>@endif
@if($event->email_error)<p>{{ $event->email_error }}</p>@endif
@foreach(($event->metadata['recovery'] ?? []) as $review)<p>Recovery review: {{ $review['actor'] }} — {{ $review['note'] }}</p>@endforeach
</div>
@empty<p>No staff history yet.</p>@endforelse
</x-filament::section>
</x-filament-panels::page>
