@if(\App\Support\StaffWorkspaceAccess::allows(auth('web')->user(),'notifications.view'))
<details data-staff-notification-sound data-user="{{ (string) auth('web')->id() }}" data-endpoint="{{ route('staff.notification-sound.poll') }}" style="position:relative;margin:0 .5rem">
<summary data-sound-summary aria-label="Notification sound settings" style="cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:.8rem;white-space:nowrap">Sound off</summary>
<div style="position:absolute;right:0;top:100%;width:min(18rem,85vw);padding:1rem;background:white;border:1px solid #e7e5e4;border-radius:.75rem;box-shadow:0 12px 32px #0002;z-index:60;color:#292524">
<strong>Notification sound</strong><p data-sound-status role="status" aria-live="polite" style="font-size:.85rem;margin:.5rem 0;line-height:1.5">Off by default. Enable in this browser.</p>
<div style="display:flex;flex-wrap:wrap;gap:.5rem">
<button type="button" data-sound-enable style="min-height:44px;padding:.5rem .75rem;border:1px solid #a8a29e;border-radius:.5rem">Enable</button>
<button type="button" data-sound-test style="min-height:44px;padding:.5rem .75rem;border:1px solid #a8a29e;border-radius:.5rem">Test</button>
<button type="button" data-sound-mute style="min-height:44px;padding:.5rem .75rem;border:1px solid #a8a29e;border-radius:.5rem">Mute</button>
</div>
<p style="font-size:.75rem;line-height:1.5;margin-top:.6rem">Checks every 20 seconds in an active staff tab. Your own new unread alerts only. Device volume and browser restrictions apply. No background push.</p>
</div>
</details>
<script defer src="{{ asset('staff-assets/notification-sound.js') }}?v={{ filemtime(public_path('staff-assets/notification-sound.js')) }}"></script>
@endif
