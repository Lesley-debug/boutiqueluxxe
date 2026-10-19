<?php

namespace App\Http\Controllers\Admin;

use App\Filament\Resources\Orders\OrderResource;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrderController extends Controller
{
    private function open(Request $request, string $url)
    {
        return $request->headers->has('X-Inertia') ? Inertia::location($url) : redirect()->to($url);
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Order::class);
        $params = [];
        if ($request->filled('search')) { $params['tableSearch'] = (string) $request->string('search'); }
        if (in_array($request->input('status'), ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], true)) {
            $params['tableFilters'] = ['status' => ['value' => $request->input('status')]];
        }
        return $this->open($request, OrderResource::getUrl('index', $params, panel: 'staff'));
    }

    public function show(Request $request, Order $order)
    {
        Gate::authorize('view', $order);
        return $this->open($request, OrderResource::getUrl('view', ['record' => $order], panel: 'staff'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        Gate::authorize('update', $order);
        // Deliberately do not replay an old mutation. Use the audited Filament action.
        return $this->open($request, OrderResource::getUrl('view', ['record' => $order], panel: 'staff'));
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        Gate::authorize('update', $order);
        return $this->open($request, OrderResource::getUrl('view', ['record' => $order], panel: 'staff'));
    }
}
