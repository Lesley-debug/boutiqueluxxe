<?php

namespace App\Services;

use App\Models\Style;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

final class StaffStyleEditor
{
    public function save(User $actor, array $data, ?Style $style = null, string $prefix = ''): Style
    {
        Gate::forUser($actor)->authorize($style ? 'update' : 'create', $style ?? Style::class);
        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:100'],
            'new_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
        if ($validator->fails()) {
            throw ValidationException::withMessages(collect($validator->errors()->messages())->mapWithKeys(fn ($value, $key) => [$prefix.$key => $value])->all());
        }
        $savedFiles = [];
        try {
            return DB::transaction(function () use ($data, $style, &$savedFiles): Style {
                $record = $style ? Style::query()->whereKey($style->id)->lockForUpdate()->firstOrFail() : new Style;
                $record->name = trim($data['name']);
                if (! $record->exists) {
                    $record->slug = app(CatalogSlug::class)->unique(Style::class, $record->name, 100);
                }
                if (! empty($data['new_image'])) {
                    $record->image = app(CatalogUpload::class)->store($data['new_image'], 'styles');
                    $savedFiles[] = $record->image;
                }
                // Existing images are retained on disk for safe rollback, never deleted before save.
                $record->save();

                return $record;
            });
        } catch (Throwable $exception) {
            app(CatalogUpload::class)->discard($savedFiles);
            if ($exception instanceof QueryException && ((int) ($exception->errorInfo[1] ?? 0) === 1062 || str_contains(strtolower($exception->getMessage()), 'unique constraint'))) {
                throw ValidationException::withMessages([$prefix.'name' => 'A duplicate URL was encountered. Please save again.']);
            }
            throw $exception;
        }
    }
}
