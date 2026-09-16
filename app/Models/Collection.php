<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Collection extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'hero_image', 'active', 'sort_order'];

    protected $casts = ['active' => 'boolean'];

    protected $appends = ['hero_image_url'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)->withTimestamps();
    }

    public function getHeroImageUrlAttribute(): ?string
    {
        return $this->hero_image ? asset('storage/' . $this->hero_image) : null;
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
