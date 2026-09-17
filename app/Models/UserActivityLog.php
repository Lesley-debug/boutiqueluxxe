<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserActivityLog extends Model
{
    /**
     * Activity types
     */
    const TYPE_LOGIN = 'login';
    const TYPE_LOGOUT = 'logout';
    const TYPE_REGISTER = 'register';
    const TYPE_ORDER_PLACED = 'order_placed';
    const TYPE_ORDER_VIEWED = 'order_viewed';
    const TYPE_WISHLIST_ADDED = 'wishlist_added';
    const TYPE_WISHLIST_REMOVED = 'wishlist_removed';
    const TYPE_CART_UPDATED = 'cart_updated';
    const TYPE_PRODUCT_VIEWED = 'product_viewed';
    const TYPE_PROFILE_UPDATED = 'profile_updated';
    const TYPE_ADDRESS_ADDED = 'address_added';
    const TYPE_ADDRESS_UPDATED = 'address_updated';
    const TYPE_ADDRESS_DELETED = 'address_deleted';

    protected $fillable = [
        'user_id',
        'activity_type',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the activity log
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an activity
     */
    public static function log(
        int $userId,
        string $type,
        string $description,
        ?array $metadata = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'activity_type' => $type,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
        ]);
    }

    /**
     * Scope to filter by activity type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('activity_type', $type);
    }

    /**
     * Scope to recent activities
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
