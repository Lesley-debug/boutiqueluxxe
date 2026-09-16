<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'style_id',
        'brand',
        'name',
        'slug',
        'description',
        'base_price',
        'sale_price',
        'status',
        'featured',
        'new_arrival',
    ];

    protected $appends = ['display_price', 'in_stock'];

    protected $casts = [
        'base_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'featured' => 'boolean',
        'new_arrival' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->images()->where('is_primary', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeNewArrivals($query)
    {
        return $query->where('new_arrival', true);
    }

    public function getDisplayPriceAttribute(): float
    {
        return (float) ($this->sale_price ?? $this->base_price);
    }

    public function getInStockAttribute(): bool
    {
        return $this->variants->sum('stock_quantity') > 0;
    }

    public function style(): BelongsTo
    {
        return $this->belongsTo(Style::class);
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class)->withTimestamps();
    }
}
