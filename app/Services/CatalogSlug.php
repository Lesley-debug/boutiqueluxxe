<?php

namespace App\Services;

use Illuminate\Support\Str;

final class CatalogSlug
{
    public function unique(string $model, string $name, int $maxLength = 255): string
    {
        $base = Str::substr(Str::slug($name) ?: 'item', 0, $maxLength - 20);
        $candidate = $base;
        $suffix = 2;
        while ($model::query()->where('slug', $candidate)->exists()) {
            $candidate = $base.'-'.$suffix++;
        }

        return $candidate;
    }
}
