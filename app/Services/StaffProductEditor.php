<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

final class StaffProductEditor
{
    private function fail(string $field, string $message, string $prefix): never
    {
        [$target, $message] = $this->formError($field, $message);
        throw ValidationException::withMessages([$prefix.$target => $message]);
    }

    private function formError(string $field, string $message): array
    {
        $parts = explode('.', $field);
        if (count($parts) > 1 && in_array($parts[0], ['variant_rows', 'image_rows', 'new_photos'], true)) {
            $label = $parts[0] === 'variant_rows' ? 'Option' : 'Photo';
            return [$parts[0], $label.' '.((int) $parts[1] + 1).': '.$message];
        }

        return [$field, $message];
    }

    public function formData(Product $product): array
    {
        $product->load(['variants', 'images']);

        return [
            ...$product->attributesToArray(),
            'variant_rows' => $product->variants->map(fn (ProductVariant $variant): array => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'color' => $variant->color,
                'size' => $variant->size,
                'material' => $variant->material,
                'price_override' => $variant->price_override,
                'current_stock' => $variant->stock_quantity,
                'expected_stock' => $variant->stock_quantity,
                'stock_adjustment' => 0,
                'initial_stock' => 0,
            ])->all(),
            'image_rows' => $product->images->map(fn (ProductImage $image): array => [
                'id' => $image->id,
                'alt_text' => $image->alt_text,
            ])->all(),
            'cover_image_id' => $product->images->firstWhere('is_primary', true)?->id,
            'new_photos' => [],
        ];
    }

    public function save(User $actor, array $data, ?Product $product = null, string $prefix = ''): Product
    {
        Gate::forUser($actor)->authorize($product ? 'update' : 'create', $product ?? Product::class);
        foreach (['variant_rows', 'image_rows', 'new_photos'] as $field) {
            if (isset($data[$field]) && ! is_array($data[$field])) {
                $this->fail($field, 'Please submit a valid list.', $prefix);
            }
        }
        foreach (['variant_rows', 'image_rows'] as $field) {
            foreach ($data[$field] ?? [] as $row) {
                if (! is_array($row) || (isset($row['id']) && ! is_int($row['id']) && ! (is_string($row['id']) && ctype_digit($row['id'])))) {
                    $this->fail($field, 'Invalid record identifier.', $prefix);
                }
            }
        }
        $savedFiles = [];
        try {
            return DB::transaction(function () use ($data, $product, $prefix, &$savedFiles): Product {
                $record = $product ? Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail() : new Product;
                $variants = $record->exists ? $record->variants()->orderBy('id')->lockForUpdate()->get()->keyBy('id') : collect();
                $images = $record->exists ? $record->images()->lockForUpdate()->get()->keyBy('id') : collect();
                $rows = array_values($data['variant_rows'] ?? []);
                $imageRows = array_values($data['image_rows'] ?? []);
                $photos = array_values($data['new_photos'] ?? []);
                $seen = [];
                foreach ($rows as $index => &$row) {
                    $id = $row['id'] ?? null;
                    if ($id) {
                        if (! $variants->has($id) || isset($seen[$id])) {
                            $this->fail('variant_rows', 'A variant is duplicated or does not belong to this product.', $prefix);
                        }
                        $seen[$id] = true;
                        // SKU and parent ownership of existing variants are immutable in this editor.
                        $row['sku'] = $variants[$id]->sku;
                    } elseif (blank($row['sku'] ?? null)) {
                        do { $row['sku'] = 'BLX-'.Str::upper(Str::random(12)); }
                        while (ProductVariant::query()->where('sku', $row['sku'])->exists());
                    }
                }
                unset($row);
                $seenImages = [];
                foreach ($imageRows as $row) {
                    $id = $row['id'] ?? null;
                    if (! $images->has($id) || isset($seenImages[$id])) {
                        $this->fail('image_rows', 'A photo is duplicated or does not belong to this product.', $prefix);
                    }
                    $seenImages[$id] = true;
                }
                $rules = [
                    'name' => ['required', 'string', 'max:255'],
                    'category_id' => ['required', 'integer', 'exists:categories,id'],
                    'style_id' => ['nullable', 'integer', 'exists:styles,id'],
                    'brand' => ['nullable', 'string', 'max:255'],
                    'description' => ['nullable', 'string', 'max:20000'],
                    'base_price' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
                    'sale_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2', 'lt:base_price'],
                    'status' => ['required', Rule::in(['draft', 'active', 'archived'])],
                    'featured' => ['boolean'],
                    'new_arrival' => ['boolean'],
                    'variant_rows' => ['required', 'array', 'min:1', 'max:100'],
                    'variant_rows.*' => ['array'],
                    'variant_rows.*.id' => ['nullable', 'integer'],
                    'variant_rows.*.color' => ['nullable', 'string', 'max:100'],
                    'variant_rows.*.size' => ['nullable', 'string', 'max:50'],
                    'variant_rows.*.material' => ['nullable', 'string', 'max:100'],
                    'variant_rows.*.sku' => ['required', 'string', 'max:100', 'distinct'],
                    'variant_rows.*.initial_stock' => ['nullable', 'integer', 'min:0', 'max:1000000'],
                    'variant_rows.*.stock_adjustment' => ['nullable', 'integer', 'between:-1000000,1000000'],
                    'variant_rows.*.expected_stock' => ['nullable', 'integer', 'min:0'],
                    'variant_rows.*.price_override' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
                    'new_photos' => ['array', 'max:8'],
                    'new_photos.*' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
                    'image_rows' => ['array'],
                    'image_rows.*.id' => ['required', 'integer'],
                    'image_rows.*.alt_text' => ['nullable', 'string', 'max:255'],
                    'cover_image_id' => ['nullable', 'integer'],
                ];
                foreach ($rows as $index => $row) {
                    $rules['variant_rows.'.$index.'.sku'][] = Rule::unique('product_variants', 'sku')->ignore($row['id'] ?? null);
                }
                $normalized = [...$data, 'variant_rows' => $rows, 'image_rows' => $imageRows, 'new_photos' => $photos];
                foreach (['style_id', 'sale_price', 'cover_image_id'] as $key) {
                    $normalized[$key] = filled($normalized[$key] ?? null) ? $normalized[$key] : null;
                }
                $validator = Validator::make($normalized, $rules);
                if ($validator->fails()) {
                    $messages = [];
                    foreach ($validator->errors()->messages() as $field => $errors) {
                        foreach ($errors as $error) {
                            [$target, $message] = $this->formError($field, $error);
                            $messages[$prefix.$target][] = $message;
                        }
                    }
                    throw ValidationException::withMessages($messages);
                }
                $data = $validator->validated();
                if ($data['cover_image_id'] && ! $images->has($data['cover_image_id'])) {
                    $this->fail('cover_image_id', 'The cover photo must belong to this product.', $prefix);
                }
                if ($data['status'] === 'active') {
                    if ((float) $data['base_price'] <= 0 || (isset($data['sale_price']) && (float) $data['sale_price'] <= 0)) {
                        $this->fail('base_price', 'A published product must have a price greater than zero.', $prefix);
                    }
                    foreach ($data['variant_rows'] as $index => $row) {
                        if (filled($row['price_override'] ?? null) && (float) $row['price_override'] <= 0) {
                            $this->fail('variant_rows.'.$index.'.price_override', 'A published option price must be positive, or blank to use the product price.', $prefix);
                        }
                    }
                    $category = Category::with('parent')->findOrFail($data['category_id']);
                    if ($category->status !== 'active' || ($category->parent && $category->parent->status !== 'active')) {
                        $this->fail('category_id', 'Choose an active category with an active parent before publishing.', $prefix);
                    }
                    if ($images->isEmpty() && $photos === []) {
                        $this->fail('new_photos', 'Add at least one photo before publishing. You can save a draft without photos.', $prefix);
                    }
                }
                foreach (['category_id', 'style_id', 'brand', 'name', 'description', 'base_price', 'sale_price', 'status'] as $key) {
                    $record->{$key} = $data[$key] ?? null;
                }
                $record->name = trim($record->name);
                $record->featured = $data['featured'] ?? false;
                $record->new_arrival = $data['new_arrival'] ?? false;
                if (! $record->exists) {
                    $record->slug = app(CatalogSlug::class)->unique(Product::class, $record->name);
                    $record->reviews_count = 0;
                    $record->rating = null;
                }
                // Existing URLs and factual rating fields are never overwritten by this form.
                $record->save();
                foreach ($data['variant_rows'] as $index => $row) {
                    if (! empty($row['id'])) {
                        $variant = $variants[$row['id']];
                        $delta = (int) ($row['stock_adjustment'] ?? 0);
                        if ($delta !== 0 && (! isset($row['expected_stock']) || (int) $row['expected_stock'] !== $variant->stock_quantity)) {
                            $this->fail('variant_rows.'.$index.'.stock_adjustment', 'Stock changed since this form was opened. Reload before adjusting it.', $prefix);
                        }
                        $quantity = $variant->stock_quantity + $delta;
                        if ($quantity < 0 || $quantity > 1000000) {
                            $this->fail('variant_rows.'.$index.'.stock_adjustment', 'The resulting stock must be between 0 and 1,000,000.', $prefix);
                        }
                    } else {
                        $variant = new ProductVariant(['product_id' => $record->id, 'sku' => $row['sku']]);
                        $quantity = (int) ($row['initial_stock'] ?? 0);
                    }
                    foreach (['color', 'size', 'material', 'price_override'] as $key) {
                        $variant->{$key} = filled($row[$key] ?? null) ? $row[$key] : null;
                    }
                    $variant->stock_quantity = $quantity;
                    $variant->save();
                }
                // Omitted existing rows are preserved: this editor cannot delete variants.
                $position = 0;
                foreach ($data['image_rows'] as $row) {
                    $image = $images[$row['id']];
                    $image->update(['alt_text' => $row['alt_text'] ?? $record->name, 'sort_order' => $position++]);
                }
                foreach ($images as $id => $image) {
                    if (! isset($seenImages[$id])) { $image->delete(); }
                }
                foreach ($photos as $file) {
                    $path = app(CatalogUpload::class)->store($file, 'products');
                    $savedFiles[] = $path;
                    $record->images()->create(['path' => $path, 'alt_text' => $record->name, 'sort_order' => $position++, 'is_primary' => false]);
                }
                $cover = $data['cover_image_id'] ?: ($record->images()->where('is_primary', true)->orderBy('sort_order')->value('id') ?: $record->images()->orderBy('sort_order')->value('id'));
                if ($cover) {
                    $record->images()->update(['is_primary' => false]);
                    $record->images()->whereKey($cover)->update(['is_primary' => true]);
                }
                if ($record->status === 'archived') { $this->clearActiveReferences($record); }

                return $record->fresh(['variants', 'images', 'category', 'style']);
            });
        } catch (Throwable $exception) {
            app(CatalogUpload::class)->discard($savedFiles);
            if ($exception instanceof QueryException && ((int) ($exception->errorInfo[1] ?? 0) === 1062 || str_contains(strtolower($exception->getMessage()), 'unique constraint'))) {
                $this->fail('name', 'A duplicate URL or SKU was encountered. Please check the SKU or save again.', $prefix);
            }
            throw $exception;
        }
    }

    private function clearActiveReferences(Product $product): void
    {
        $ids = $product->variants()->pluck('id');
        CartItem::query()->whereIn('product_variant_id', $ids)->delete();
        WishlistItem::query()->where('product_id', $product->id)->delete();
        $product->update(['featured' => false, 'new_arrival' => false]);
    }

    public function archive(User $actor, Product $product): void
    {
        Gate::forUser($actor)->authorize('update', $product);
        DB::transaction(function () use ($product): void {
            $record = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $record->variants()->orderBy('id')->lockForUpdate()->get();
            $record->update(['status' => 'archived']);
            $this->clearActiveReferences($record);
        });
    }
}
