<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

final class CatalogUpload
{
    public function store(UploadedFile $file, string $directory): string
    {
        $extension = match ($file->getMimeType()) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => throw new RuntimeException('Unsupported catalog image format.'),
        };
        $path = $file->storeAs($directory, Str::uuid().'.'.$extension, 'public');
        if (! is_string($path) || $path === '') {
            throw new RuntimeException('Catalog image could not be stored.');
        }

        return $path;
    }

    public function discard(array $paths): void
    {
        foreach ($paths as $path) {
            try {
                Storage::disk('public')->delete($path);
            } catch (\Throwable $exception) {
                report($exception);
            }
        }
    }
}
