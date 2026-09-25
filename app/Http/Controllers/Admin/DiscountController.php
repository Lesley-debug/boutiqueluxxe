<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Discounts/Index', [
            'discounts' => Discount::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Discounts/Form');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        Discount::create($data);

        return redirect()->route('admin.discounts.index')->with('success', 'Discount created.');
    }

    public function edit(Discount $discount)
    {
        return Inertia::render('Admin/Discounts/Form', ['discount' => $discount]);
    }

    public function update(Request $request, Discount $discount)
    {
        $data = $this->validated($request, $discount->id);
        $discount->update($data);

        return redirect()->route('admin.discounts.index')->with('success', 'Discount updated.');
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();

        return redirect()->route('admin.discounts.index')->with('success', 'Discount deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:discounts,code' . ($ignoreId ? ",{$ignoreId}" : '')],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => [
                'required',
                'numeric',
                'min:0',
                Rule::when($request->input('type') === 'percentage', ['max:100']),
            ],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'active' => ['boolean'],
        ]);
    }
}
