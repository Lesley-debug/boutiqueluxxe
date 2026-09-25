<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Style;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isAdminRoute = $request->is('admin/*');

        $shared = [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()?->grantedPermissions() ?? [],
            ],
            'features' => [
                'googleAuth' => (bool) (
                    config('services.google.client_id')
                    && config('services.google.client_secret')
                ),
            ],
            'errors' => fn() => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->getMessages()
                : (object) [],
        ];

        $routeName = $request->route()?->getName();
        $pageSeo = config("seo.pages.{$routeName}", []);
        $private = $request->is(
            'admin*',
            'account*',
            'login',
            'register',
            'forgot-password',
            'reset-password*',
            'email/verify*',
            'cart',
            'checkout',
            'orders/*/confirmation',
        );

        $shared['seo'] = [
            ...config('seo.default'),
            ...$pageSeo,
            'canonical' => url()->current(),
            'image' => isset($pageSeo['image'])
                ? url($pageSeo['image'])
                : url(config('seo.default_image')),
            'robots' => $private ? 'noindex,nofollow,noarchive' : 'index,follow',
        ];

        if (!$isAdminRoute) {
            $shared['cart'] = function () use ($request) {
                $cart = $request->user()
                    ? Cart::where('user_id', $request->user()->id)
                        ->with(['items.variant.product.images', 'discount'])
                        ->first()
                    : Cart::where('session_id', $request->session()->getId())
                        ->with(['items.variant.product.images', 'discount'])
                        ->first();

                if (!$cart) {
                    return [
                        'id' => null,
                        'item_count' => 0,
                        'items' => [],
                        'subtotal' => 0,
                        'discount_amount' => 0,
                        'total' => 0,
                        'discount' => null,
                    ];
                }

                return [
                    'id' => $cart->id,
                    'item_count' => $cart->item_count,
                    'subtotal' => $cart->subtotal,
                    'discount_amount' => $cart->discount_amount,
                    'total' => $cart->total,
                    'discount' => $cart->discount ? [
                        'id' => $cart->discount->id,
                        'code' => $cart->discount->code,
                    ] : null,
                    'items' => $cart->items->map(fn($item) => [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'line_total' => $item->line_total,
                        'variant' => [
                            'id' => $item->variant->id,
                            'sku' => $item->variant->sku,
                            'color' => $item->variant->color,
                            'size' => $item->variant->size,
                            'material' => $item->variant->material,
                            'product' => [
                                'id' => $item->variant->product->id,
                                'name' => $item->variant->product->name,
                                'slug' => $item->variant->product->slug,
                                'images' => $item->variant->product->images->map(fn($img) => [
                                    'url' => $img->url,
                                    'is_primary' => $img->is_primary,
                                ])->values(),
                            ],
                        ],
                    ])->values(),
                ];
            };

            $shared['megaMenu'] = fn() => Category::topLevel()->active()->with([
                'children' => fn($q) => $q->active()->orderBy('sort_order'),
            ])->orderBy('sort_order')->get()->map(fn($top) => [
                    'id' => $top->id,
                    'name' => $top->name,
                    'slug' => $top->slug,
                    'audience' => $top->children->map(fn($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                    ]),
                ]);

            $shared['shopByStyle'] = fn() => Style::whereHas('products', fn($q) => $q->active())->orderBy('name')->get(['id', 'name', 'slug']);
        } else {
            $shared['cart'] = fn() => ['id' => null, 'item_count' => 0, 'items' => [], 'subtotal' => 0, 'discount_amount' => 0, 'total' => 0, 'discount' => null];
            $shared['megaMenu'] = fn() => [];
            $shared['shopByStyle'] = fn() => [];
        }

        if ($request->user()) {
            $shared['notifications'] = fn() => $request->user()->notifications()
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn($n) => [
                    'id' => $n->id,
                    'type' => $n->type,
                    'data' => $n->data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ]);

            $shared['unreadNotificationsCount'] = fn() => $request->user()->unreadNotifications()->count();
            $shared['wishlist_count'] = fn() => $request->user()->wishlistItems()->count();
        }

        if ($request->user()?->is_admin) {
            $shared['adminNotifications'] = fn() => [
                'unread_count' => $request->user()->unreadNotifications()->count(),
                'recent' => $request->user()->notifications()->latest()->limit(5)->get()->map(fn($n) => [
                    'id' => $n->id,
                    'data' => $n->data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ]),
            ];
        }

        return $shared;
    }
}