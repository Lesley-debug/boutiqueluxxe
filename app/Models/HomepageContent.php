<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageContent extends Model
{
    protected $table = 'homepage_content';

    protected $guarded = [];

    protected $appends = ['editorial_image_url', 'watches_image_url', 'story_image_url'];

    public function getEditorialImageUrlAttribute(): ?string
    {
        return $this->editorial_image ? asset('storage/' . $this->editorial_image) : null;
    }

    public function getWatchesImageUrlAttribute(): ?string
    {
        return $this->watches_image ? asset('storage/' . $this->watches_image) : null;
    }

    public function getStoryImageUrlAttribute(): ?string
    {
        return $this->story_image ? asset('storage/' . $this->story_image) : null;
    }

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
