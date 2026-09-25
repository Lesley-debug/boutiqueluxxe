<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'fulfillment_method',
        'payment_status',
        'payment_method',
        'payment_reference',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'city',
        'region',
        'notes',
        'subtotal',
        'shipping_cost',
        'discount_code',
        'discount_amount',
        'total',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(Str::random(8));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
    public function guestConfirmationUrl(): string
    {
        $relativeUrl = URL::temporarySignedRoute(
            'orders.confirmation',
            now()->addDays(max(1, (int) config('orders.guest_confirmation_link_ttl_days', 30))),
            ['orderNumber' => $this->order_number],
            absolute: false,
        );

        return rtrim((string) config('app.url'), '/').$relativeUrl;
    }

}
