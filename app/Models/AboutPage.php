<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutPage extends Model
{
    protected $table = 'about_page';

    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'philosophy_title',
        'philosophy_text',
        'approach_title',
        'approach_text',
        'contact_title',
        'contact_text',
    ];

    protected $appends = ['hero_image_url'];

    public function getHeroImageUrlAttribute(): ?string
    {
        return $this->hero_image ? asset('storage/' . $this->hero_image) : null;
    }

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
