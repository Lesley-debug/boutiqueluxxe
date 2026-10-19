<?php
namespace App\Services;
use App\Models\{Category, Collection, Discount, Product, User};
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\{DB, Gate, Validator};
use Illuminate\Validation\{Rule, ValidationException};
use Throwable;
final class StaffCatalogOrganizer
{
    public function fingerprint(Model $record): string
    {
        // Resource queries add products_count and may add other display aliases.
        // Only persisted editor fields belong in an optimistic-concurrency token.
        $columns = match (true) {
            $record instanceof Category => ['id','parent_id','name','slug','status','sort_order','created_at','updated_at'],
            $record instanceof Collection => ['id','name','slug','description','hero_image','active','sort_order','created_at','updated_at'],
            $record instanceof Discount => ['id','code','type','value','min_order_amount','max_uses','starts_at','expires_at','active','created_at'],
            default => throw new \InvalidArgumentException('Unsupported catalog organizer model.'),
        };
        $data = array_intersect_key($record->getRawOriginal(), array_flip($columns));
        // Normalize driver representations without discarding editable field changes.
        foreach (['id','parent_id','sort_order','max_uses'] as $key) {
            if (array_key_exists($key,$data) && $data[$key] !== null) { $data[$key] = (int)$data[$key]; }
        }
        if (array_key_exists('active',$data)) { $data['active'] = (bool)$data['active']; }
        foreach (['value','min_order_amount'] as $key) {
            if (array_key_exists($key,$data) && $data[$key] !== null) { $data[$key] = number_format((float)$data[$key],2,'.',''); }
        }
        // Discount checkout counters and their updated_at changes are intentionally
        // excluded; the locked usage count is preserved/validated when saving terms.
        ksort($data);
        if ($record instanceof Collection) { $data['members'] = $record->products()->orderBy('products.id')->pluck('products.id')->map(fn ($id) => (int) $id)->all(); }
        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
    }
    private function stale(Model $record, array $data): void
    {
        if (! is_string($data['expected_snapshot'] ?? null) || ! hash_equals($this->fingerprint($record), $data['expected_snapshot'])) {
            throw ValidationException::withMessages([($record instanceof Discount ? 'code' : 'name') => 'This record changed in another session. Reload before saving.']);
        }
    }
    private function validate(array $data, array $rules): array { return Validator::make($data, $rules)->validate(); }
    private function run(callable $operation, string $prefix, array &$files): Model
    {
        try { return DB::transaction($operation); }
        catch (Throwable $e) {
            app(CatalogUpload::class)->discard($files);
            if ($e instanceof ValidationException) { throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($v, $k) => [$prefix.$k => $v])->all()); }
            if ($e instanceof QueryException && ((int) ($e->errorInfo[1] ?? 0) === 1062 || str_contains(strtolower($e->getMessage()), 'unique constraint'))) { throw ValidationException::withMessages([$prefix.'name' => 'A duplicate URL/code was encountered. Reload and save again.']); }
            throw $e;
        }
    }
    public function category(User $actor, array $data, ?Category $category = null, string $prefix = ''): Category
    {
        Gate::forUser($actor)->authorize($category ? 'update' : 'create', $category ?? Category::class); $files = [];
        return $this->run(function () use ($data, $category): Category {
            // Stable locks serialize changes to the existing two-level category tree.
            $tree = Category::orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $record = $category ? $tree->get($category->id) : new Category; abort_unless($record, 404);
            if ($record->exists) { $this->stale($record, $data); }
            if ($record->exists && ! array_key_exists('parent_id',$data)) { $data['parent_id']=$record->parent_id; }
            $v = $this->validate($data, ['name'=>['required','string','max:255','regex:/\S/u'], 'parent_id'=>['nullable','integer','min:1'], 'status'=>['required',Rule::in(['active','inactive'])], 'sort_order'=>['required','integer','min:0','max:4294967295']]);
            $parent = empty($v['parent_id']) ? null : $tree->get((int) $v['parent_id']);
            if (! empty($v['parent_id']) && (! $parent || $parent->parent_id || ($record->exists && ($parent->id === $record->id || $tree->contains(fn ($node) => $node->parent_id == $record->id))))) {
                throw ValidationException::withMessages(['parent_id'=>'Choose a top-level category. A category with children cannot become a child.']);
            }
            if ($v['status'] === 'active' && $parent && $parent->status !== 'active') { throw ValidationException::withMessages(['status'=>'Activate the parent category first.']); }
            $record->name = trim($v['name']); $record->parent_id = $parent?->id; $record->status = $v['status']; $record->sort_order = $v['sort_order'];
            if (! $record->exists) { $record->slug = app(CatalogSlug::class)->unique(Category::class, $record->name); }
            // Inactive parent hides descendants publicly; original child status and product associations remain.
            $record->save(); return $record->fresh();
        }, $prefix, $files);
    }
    public function collection(User $actor, array $data, ?Collection $collection = null, string $prefix = ''): Collection
    {
        Gate::forUser($actor)->authorize($collection ? 'update' : 'create', $collection ?? Collection::class); $files = [];
        return $this->run(function () use ($data, $collection, &$files): Collection {
            $record = $collection ? Collection::whereKey($collection->id)->lockForUpdate()->firstOrFail() : new Collection;
            if ($record->exists) { $this->stale($record, $data); }
            $v = $this->validate($data, ['name'=>['required','string','max:255','regex:/\S/u'], 'description'=>['nullable','string','max:10000'], 'active'=>['required','boolean'], 'sort_order'=>['required','integer','min:0','max:4294967295'], 'product_ids'=>['present','array','max:500'], 'product_ids.*'=>['integer','distinct'], 'new_image'=>['nullable','file','image','mimes:jpg,jpeg,png,webp','max:4096']]);
            $ids = collect($v['product_ids'])->map(fn ($id) => (int) $id)->sort()->values();
            $products = Product::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            if ($products->count() !== $ids->count()) { throw ValidationException::withMessages(['product_ids'=>'One or more selected products no longer exist. Reload the choices.']); }
            if ($v['active'] && ! $products->contains(fn ($p) => $p->status === 'active')) { throw ValidationException::withMessages(['product_ids'=>'An active collection needs at least one active product.']); }
            $record->name = trim($v['name']); $record->description = $v['description'] ?? null; $record->active = $v['active']; $record->sort_order = $v['sort_order'];
            if (! $record->exists) { $record->slug = app(CatalogSlug::class)->unique(Collection::class, $record->name); }
            if (! empty($v['new_image'])) { $record->hero_image = app(CatalogUpload::class)->store($v['new_image'], 'collections'); $files[] = $record->hero_image; }
            // Old media stays on disk for rollback; no remove-image or hard-delete action.
            $record->save(); $record->products()->sync($ids->all()); return $record->fresh();
        }, $prefix, $files);
    }
    public function discount(User $actor, array $data, ?Discount $discount = null, string $prefix = ''): Discount
    {
        Gate::forUser($actor)->authorize($discount ? 'update' : 'create', $discount ?? Discount::class); $files = [];
        return $this->run(function () use ($data, $discount): Discount {
            $record = $discount ? Discount::whereKey($discount->id)->lockForUpdate()->firstOrFail() : new Discount;
            if ($record->exists) { $this->stale($record, $data); $data['code'] = $record->code; }
            else { $data['code'] = strtoupper(trim((string) ($data['code'] ?? ''))); }
            $rules = ['type'=>['required',Rule::in(['percentage','fixed'])], 'value'=>['required','numeric','decimal:0,2','gt:0','max:99999999.99'], 'min_order_amount'=>['nullable','numeric','decimal:0,2','min:0','max:99999999.99'], 'max_uses'=>['nullable','integer','min:1','max:4294967295'], 'starts_at'=>['nullable','date'], 'expires_at'=>['nullable','date'], 'active'=>['required','boolean']];
            if (! $record->exists) { $rules['code'] = ['required','string','min:2','max:50','regex:/^[A-Z0-9][A-Z0-9_-]+$/',Rule::unique('discounts','code')]; }
            if (($data['type'] ?? null) === 'percentage') { $rules['value'][] = 'max:100'; }
            if (! empty($data['starts_at'])) { $rules['expires_at'][] = 'after_or_equal:starts_at'; }
            $v = $this->validate($data, $rules);
            if (isset($v['max_uses']) && (int) $v['max_uses'] < (int) $record->uses_count) { throw ValidationException::withMessages(['max_uses'=>'The usage limit cannot be below the already recorded uses.']); }
            if (! $record->exists) { $record->code = $data['code']; $record->uses_count = 0; }
            $record->fill($v); // Validated fields never include uses_count, code on edits, or order snapshots.
            $record->save(); return $record->fresh();
        }, $prefix, $files);
    }
}
