<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['customer_name', 'quote', 'rating', 'active', 'sort_order'];

    protected $casts = ['active' => 'boolean'];

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
