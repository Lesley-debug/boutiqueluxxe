<x-filament-panels::page>
<x-filament::section heading="Choose a small price-editing batch">
<p style="color:#57534e;line-height:1.6">Select up to 10 products, then use Load selected products. Maximum 100 options per batch. Loading replaces unsaved inputs. Search/pagination do not automatically replace your loaded batch. Prices are {{ config('commerce.currency','USD') }}; no currency conversion. No percentage/mass markup tool.</p>
<label for="pricing-search" style="display:block;margin-top:1rem">Search product name</label><input id="pricing-search" wire:model.live.debounce.400ms="search" type="search" maxlength="120" style="width:100%;padding:.75rem;border:1px solid #d6d3d1;border-radius:.5rem;margin:.4rem 0 1rem">
@foreach($products as $product)
<label style="display:flex;align-items:center;gap:.75rem;border-top:1px solid #e7e5e4;padding:.8rem 0;min-height:44px;overflow-wrap:anywhere"><input type="checkbox" wire:model.live="selected" value="{{ $product->id }}"><span><strong>{{ $product->name }}</strong><br><small>{{ $product->status }} · {{ $product->variants_count }} options · Base {{ $product->base_price }}{{ $product->sale_price!==null ? ' · Sale '.$product->sale_price : '' }}</small></span></label>
@endforeach
{{ $products->links() }}
<p style="margin-top:.75rem">{{ count($selected) }} selected. Use the top Load selected products action.</p>
</x-filament::section>
@error('rows')<p role="alert" style="color:#b91c1c">{{ $message }}</p>@enderror
@if($rows)
<x-filament::section heading="Review exact prices before saving">
<p style="color:#57534e;line-height:1.6">Blank sale removes the sale price. Blank option override inherits the product sale/base price. Published prices must be positive; sale must be lower than base. Up to two decimal places. Stock, SKU, photos, publication status and existing order totals are never edited here. Batch expires after 30 minutes; reload after a conflict.</p>
<style>.bl-price-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.bl-price-grid input{width:100%;padding:.75rem;border:1px solid #d6d3d1;border-radius:.5rem;min-height:44px}.bl-price-grid label{display:block;font-size:.85rem}@media(max-width:480px){.bl-price-grid{grid-template-columns:minmax(0,1fr)}}</style>
@foreach($rows as $index=>$row)
<article wire:key="bulk-price-{{ $row['id'] }}" style="border:1px solid #e7e5e4;border-radius:.75rem;padding:1rem;margin-top:1rem;overflow-wrap:anywhere">
<h2 style="font-weight:600">{{ $row['name'] }} <small>({{ $row['status'] }})</small></h2>
<div class="bl-price-grid" style="margin-top:.75rem"><label>Base price<input aria-label="{{ $row['name'] }} base price" type="text" inputmode="decimal" maxlength="11" wire:model="rows.{{ $index }}.base_price"></label><label>Sale price (optional)<input aria-label="{{ $row['name'] }} sale price" type="text" inputmode="decimal" maxlength="11" wire:model="rows.{{ $index }}.sale_price"></label></div>
@foreach($row['variants'] as $option=>$variant)
<label style="display:block;margin-top:.75rem">{{ $variant['sku'] }} — price override (blank inherits)<input aria-label="{{ $variant['sku'] }} price override" type="text" inputmode="decimal" maxlength="11" wire:model="rows.{{ $index }}.variants.{{ $option }}.price_override" style="display:block;width:100%;padding:.75rem;border:1px solid #d6d3d1;border-radius:.5rem;min-height:44px"></label>
@endforeach
</article>
@endforeach
<p style="margin-top:1rem">When ready, use Review &amp; save prices above. Nothing saves automatically.</p>
</x-filament::section>
@endif
</x-filament-panels::page>
