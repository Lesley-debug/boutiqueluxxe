<?php

namespace App\Support;

use App\Models\Product;
use App\Models\Style;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Styles\StyleResource;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class LegacyCatalogHandoff
{
    public static function authorize(Request $request): void
    {
        abort_unless(CatalogAccess::allows($request->user()), 403);
    }

    private static function navigate(Request $request, string $url)
    {
        if (! $request->isMethodSafe()) {
            // Session-only UI notice, NOT a database notification or email.
            Notification::make()->warning()->title('No changes applied')
                ->body('This older catalog form is retired. Review the current values and save in the staff editor.')
                ->send();
        }

        return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url);
    }

    public static function products(Request $request, string $page = 'index', ?Product $product = null)
    {
        self::authorize($request);
        return self::navigate($request, ProductResource::getUrl($page, $product ? ['record' => $product] : [], panel: 'staff'));
    }

    public static function styles(Request $request, string $page = 'index', ?Style $style = null)
    {
        self::authorize($request);
        return self::navigate($request, StyleResource::getUrl($page, $style ? ['record' => $style] : [], panel: 'staff'));
    }
}
