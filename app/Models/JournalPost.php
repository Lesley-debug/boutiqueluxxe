<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalPost extends Model
{
    protected $fillable = ['title', 'slug', 'excerpt', 'content', 'cover_image', 'status', 'published_at'];

    protected $casts = ['published_at' => 'datetime'];

    protected $appends = ['cover_image_url'];

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->cover_image ? asset('storage/' . $this->cover_image) : null;
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')->whereNotNull('published_at');
    }
}
