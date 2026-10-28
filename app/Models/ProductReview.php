<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = ['product_id', 'customer_name', 'rating', 'quote', 'active'];

    protected $casts = ['active' => 'boolean', 'rating' => 'integer'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    protected static function booted(): void
    {
        $recalculate = function (self $review) {
            $product = Product::find($review->product_id);
            if (! $product) return;
            $active = self::where('product_id', $review->product_id)->where('active', true)->get();
            $product->reviews_count = $active->count();
            $product->rating = $active->count() > 0 ? round($active->avg('rating'), 2) : null;
            $product->save();
        };

        static::saved($recalculate);
        static::deleted($recalculate);
    }
}
