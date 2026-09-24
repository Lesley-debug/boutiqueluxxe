<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Discount extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'uses_count',
        'starts_at',
        'expires_at',
        'active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function isValidFor(float $subtotal): bool
    {
        if (! $this->active) {
            return false;
        }

        $now = Carbon::now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        if ($this->min_order_amount !== null && $subtotal < (float) $this->min_order_amount) {
            return false;
        }

        return true;
    }

    public function calculateDiscountAmount(float $subtotal): float
    {
        $subtotal = max(0, $subtotal);
        $value = max(0, (float) $this->value);

        if ($this->type === 'percentage') {
            $percentage = min($value, 100);

            return min(round($subtotal * ($percentage / 100), 2), $subtotal);
        }

        // Fixed discounts can never exceed the order subtotal.
        return min($value, $subtotal);
    }
}
