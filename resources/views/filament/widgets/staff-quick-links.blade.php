<x-filament-widgets::widget>
    <x-filament::section heading="Manage your store">
        <p style="margin: 0 0 1rem; color: #57534e; line-height: 1.6;">
            Catalog, orders, contacts, discounts and public content use this workspace. Staff access is managed only by the super admin. Notifications and newsletter remain in the current admin during migration.
        </p>
        <style>
            .bl-staff-links { display: grid; grid-template-columns: minmax(0, 1fr); gap: .75rem; }
            .bl-staff-link { display: block; border: 1px solid #e7e5e4; border-radius: .75rem; padding: 1rem; background: #fafaf9; color: #292524; text-decoration: none; overflow-wrap: anywhere; }
            .bl-staff-link:hover { background: #fffbeb; border-color: #d97706; }
            .bl-staff-link:focus-visible { outline: 3px solid #d97706; outline-offset: 3px; }
            .bl-staff-link small { display: block; margin-top: .25rem; color: #78716c; }
            @media (min-width: 640px) { .bl-staff-links { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (min-width: 1100px) { .bl-staff-links { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        </style>
        <div class="bl-staff-links">
            @foreach ($this->links() as $link)
                <a class="bl-staff-link" href="{{ url($link['path']) }}">
                    <strong>{{ $link['label'] }}</strong>
                    <small>{{ str_starts_with($link['path'], '/staff/') ? 'Open staff workspace' : 'Open current admin' }} &rarr;</small>
                </a>
            @endforeach
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
