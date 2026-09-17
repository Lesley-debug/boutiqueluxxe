<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\DatabaseNotification;

class UserNotification extends DatabaseNotification
{
    /**
     * Get the user notification types
     */
    const TYPE_ORDER_PLACED = 'order_placed';
    const TYPE_ORDER_STATUS_UPDATED = 'order_status_updated';
    const TYPE_WELCOME = 'welcome';
    const TYPE_LOW_STOCK = 'low_stock';
    const TYPE_NEW_ORDER = 'new_order';

    /**
     * Scope to unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope to read notifications
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        if (is_null($this->read_at)) {
            $this->forceFill(['read_at' => $this->freshTimestamp()])->save();
        }
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread()
    {
        if (!is_null($this->read_at)) {
            $this->forceFill(['read_at' => null])->save();
        }
    }
}
