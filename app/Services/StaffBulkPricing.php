<?php
namespace App\Services;
use App\Models\{User,Product,ProductVariant,UserActivityLog};
use App\Support\CatalogAccess;
use Illuminate\Support\Facades\{Crypt,DB,Validator};
use Illuminate\Validation\ValidationException;
final class StaffBulkPricing
{
    public const MAX_PRODUCTS=10;
    public const MAX_VARIANTS=100;
    private function authorize(?User $actor): void { abort_unless(CatalogAccess::allows($actor),403); }
    private function fail(string $message): never { throw ValidationException::withMessages(['rows'=>$message]); }
    public function fingerprint(Product $product): string
    {
        $v=['id'=>(int)$product->id,'name'=>$product->name,'status'=>$product->status,'category_id'=>(int)$product->category_id,'base_price'=>$product->base_price,'sale_price'=>$product->sale_price,'variants'=>$product->variants->sortBy('id')->map(fn ($row)=>['id'=>(int)$row->id,'product_id'=>(int)$row->product_id,'sku'=>$row->sku,'color'=>$row->color,'size'=>$row->size,'material'=>$row->material,'price_override'=>$row->price_override])->values()->all()];
        // Ignore display aliases, stock and timestamps: checkout must not create a false price conflict.
        return hash('sha256',json_encode($v,JSON_THROW_ON_ERROR));
    }
    public function load(User $actor,array $ids): array
    {
        $this->authorize($actor); $ids=Validator::make(['ids'=>$ids],['ids'=>['required','array','min:1','max:10'],'ids.*'=>['required','integer','min:1','distinct']])->validate()['ids'];
        return DB::transaction(function () use ($actor,$ids): array {
            $products=Product::whereKey($ids)->orderBy('id')->lockForUpdate()->get();
            if ($products->count()!==count($ids)) { $this->fail('A selected product no longer exists. Reload the selection.'); }
            $variants=ProductVariant::whereIn('product_id',$products->modelKeys())->orderBy('id')->lockForUpdate()->limit(self::MAX_VARIANTS+1)->get();
            if ($variants->count()>self::MAX_VARIANTS) { $this->fail('Choose a smaller batch: at most 100 options across 10 products.'); }
            $rows=[]; $snapshots=[];
            foreach ($products as $product) {
                $product->setRelation('variants',$variants->where('product_id',$product->id)->values());
                $rows[]=['id'=>(int)$product->id,'name'=>$product->name,'status'=>$product->status,'base_price'=>$product->base_price,'sale_price'=>$product->sale_price,'variants'=>$product->variants->map(fn ($v)=>['id'=>(int)$v->id,'sku'=>$v->sku,'price_override'=>$v->price_override])->all()];
                $snapshots[(string)$product->id]=$this->fingerprint($product);
            }
            return ['rows'=>$rows,'snapshot'=>Crypt::encryptString(json_encode(['v'=>1,'actor'=>(string)$actor->id,'loaded_at'=>now()->timestamp,'products'=>$snapshots],JSON_THROW_ON_ERROR))];
        });
    }
    private function money(mixed $value,bool $nullable,string $label): ?string
    {
        if ($nullable && ($value===null || $value==='')) { return null; }
        if ((! is_string($value) && ! is_int($value)) || ! preg_match('/\A\d{1,8}(?:\.\d{1,2})?\z/',(string)$value)) { $this->fail($label.': enter 0 to 99,999,999.99 with at most two decimal places, without currency symbols.'); }
        $parts=explode('.',(string)$value); return ((int)$parts[0]).'.'.str_pad($parts[1] ?? '',2,'0');
    }
    private function cents(?string $value): ?int { return $value===null?null:(int)str_replace('.','',$value); }
    public function save(User $actor,array $rows,string $snapshot,array $confirmation): int
    {
        $this->authorize($actor);
        $confirm=Validator::make($confirmation,['reason'=>['required','string','min:3','max:500'],'confirmed'=>['accepted']])->validate();
        if (preg_replace('/[\s\p{Z}\x{200B}]+/u','',$confirm['reason'])==='') { $this->fail('Enter a meaningful private audit reason.'); }
        try { $state=json_decode(Crypt::decryptString($snapshot),true,512,JSON_THROW_ON_ERROR); } catch (\Throwable $e) { $this->fail('Invalid batch snapshot. Reload the selection.'); }
        if (! is_array($state) || ($state['v'] ?? null)!==1 || ($state['actor'] ?? null)!==(string)$actor->id || ! is_int($state['loaded_at'] ?? null) || $state['loaded_at']<now()->timestamp-1800 || $state['loaded_at']>now()->timestamp+5 || ! is_array($state['products'] ?? null) || count($state['products'])<1 || count($state['products'])>self::MAX_PRODUCTS) { $this->fail('Batch expired or belongs to another account. Reload it before saving.'); }
        $rows=Validator::make(['rows'=>$rows],['rows'=>['required','array','min:1','max:10'],'rows.*'=>['array'],'rows.*.id'=>['required','integer','min:1','distinct'],'rows.*.base_price'=>['present'],'rows.*.sale_price'=>['present'],'rows.*.variants'=>['present','array','max:100'],'rows.*.variants.*'=>['array'],'rows.*.variants.*.id'=>['required','integer','min:1'],'rows.*.variants.*.price_override'=>['present']])->validate()['rows'];
        $ids=array_map('intval',array_column($rows,'id')); $expected=array_map('intval',array_keys($state['products'])); sort($ids);sort($expected);
        if ($ids!==$expected) { $this->fail('Batch membership changed. Reload the selection; no prices were saved.'); }
        if (array_sum(array_map(fn ($r)=>count($r['variants']),$rows))>self::MAX_VARIANTS) { $this->fail('Batch exceeds 100 options.'); }
        return DB::transaction(function () use ($actor,$rows,$state,$ids,$confirm,$snapshot): int {
            $lockedActor=User::whereKey($actor->id)->lockForUpdate()->first(); $this->authorize($lockedActor);
            $receipt=hash('sha256',$snapshot);
            if (UserActivityLog::where('user_id',$actor->id)->where('activity_type','bulk_prices_updated')->where('metadata->batch_receipt',$receipt)->exists()) { $this->fail('This batch was already saved. Reload current prices before continuing.'); }
            $products=Product::whereKey($ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            if ($products->count()!==count($ids)) { $this->fail('A product was removed. Reload the batch.'); }
            $variants=ProductVariant::whereIn('product_id',$ids)->orderBy('id')->lockForUpdate()->limit(self::MAX_VARIANTS+1)->get();
            if ($variants->count()>self::MAX_VARIANTS) { $this->fail('The option batch grew beyond 100. Reload a smaller selection.'); }
            foreach ($products as $p) { $p->setRelation('variants',$variants->where('product_id',$p->id)->values()); if (! hash_equals($state['products'][(string)$p->id],$this->fingerprint($p))) { $this->fail('Prices, product identity, publication status or option membership changed. Reload the whole batch.'); } }
            $plans=[];
            foreach ($rows as $row) {
                $p=$products[(int)$row['id']]; $base=$this->money($row['base_price'],false,$p->name.' base price'); $sale=$this->money($row['sale_price'],true,$p->name.' sale price');
                if ($sale!==null && $this->cents($sale)>=$this->cents($base)) { $this->fail($p->name.': sale price must be lower than base price.'); }
                if ($p->status==='active' && ($this->cents($base)<=0 || ($sale!==null && $this->cents($sale)<=0))) { $this->fail($p->name.': published prices must be greater than zero.'); }
                $seen=[];$prices=[];
                foreach ($row['variants'] as $v) {
                    $id=(int)$v['id']; $original=$p->variants->firstWhere('id',$id);
                    if (! $original || isset($seen[$id])) { $this->fail('A duplicated or foreign option was submitted. Reload the batch.'); }
                    $seen[$id]=true; $price=$this->money($v['price_override'],true,$original->sku.' override');
                    if ($p->status==='active' && $price!==null && $this->cents($price)<=0) { $this->fail($original->sku.': published option override must be positive, or blank to inherit.'); }
                    $prices[$id]=$price;
                }
                if (count($seen)!==$p->variants->count()) { $this->fail('An option was omitted. Reload the complete batch before saving.'); }
                ksort($prices,SORT_NUMERIC);
                $plans[]=['product'=>$p,'base'=>$base,'sale'=>$sale,'variants'=>$prices];
            }
            $audit=[];
            foreach ($plans as $plan) {
                $p=$plan['product'];$before=['base_price'=>$p->base_price,'sale_price'=>$p->sale_price,'variants'=>$p->variants->mapWithKeys(fn ($v)=>[(string)$v->id=>$v->price_override])->all()];
                $after=['base_price'=>$plan['base'],'sale_price'=>$plan['sale'],'variants'=>$plan['variants']];
                if ($before===$after) { continue; }
                $p->base_price=$plan['base'];$p->sale_price=$plan['sale']; if ($p->isDirty()) { $p->save(); }
                foreach ($p->variants as $v) { $v->price_override=$plan['variants'][$v->id]; if ($v->isDirty('price_override')) { $v->save(); } }
                $audit[]=['product_id'=>$p->id,'before'=>$before,'after'=>$after];
            }
            if ($audit) { UserActivityLog::create(['user_id'=>$actor->id,'activity_type'=>'bulk_prices_updated','description'=>'Catalog prices updated in a confirmed batch','metadata'=>['batch_receipt'=>$receipt,'changes'=>$audit,'reason'=>$confirm['reason']],'ip_address'=>request()->ip(),'user_agent'=>mb_substr((string)request()->userAgent(),0,255)]); }
            return count($audit);
        },3);
    }
}
