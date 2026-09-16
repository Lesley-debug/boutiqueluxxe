<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Style extends Model
{
    protected $fillable = ['name', 'slug', 'image'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
