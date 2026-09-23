<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'eyebrow',
        'title',
        'subtitle',
        'primary_cta_text',
        'primary_cta_url',
        'secondary_cta_text',
        'secondary_cta_url',
        'image',
        'active',
        'sort_order',
    ];

    protected $casts = ['active' => 'boolean'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
