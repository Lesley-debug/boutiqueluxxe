<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWorkflowEvent extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'snapshot' => 'array', 'metadata' => 'array', 'email_attempts' => 'integer',
        'email_claimed_at' => 'datetime', 'email_sent_at' => 'datetime',
    ];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function actor(): BelongsTo { return $this->belongsTo(User::class, 'actor_id'); }
}
