<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $this->mergeDuplicateCarts('user_id');
            $this->mergeDuplicateCarts('session_id');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->unique('user_id', 'carts_unique_user_owner');
            $table->unique('session_id', 'carts_unique_session_owner');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropUnique('carts_unique_user_owner');
            $table->dropUnique('carts_unique_session_owner');
        });
    }

    private function mergeDuplicateCarts(string $ownerColumn): void
    {
        $owners = DB::table('carts')
            ->select($ownerColumn)
            ->whereNotNull($ownerColumn)
            ->groupBy($ownerColumn)
            ->havingRaw('COUNT(*) > 1')
            ->pluck($ownerColumn);

        foreach ($owners as $owner) {
            $carts = DB::table('carts')
                ->where($ownerColumn, $owner)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $target = $carts->first();

            if (! $target) {
                continue;
            }

            $discountId = $target->discount_id
                ?? $carts->first(fn ($cart) => $cart->discount_id !== null)?->discount_id;

            foreach ($carts->skip(1) as $duplicate) {
                $items = DB::table('cart_items')
                    ->where('cart_id', $duplicate->id)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                foreach ($items as $item) {
                    $existing = DB::table('cart_items')
                        ->where('cart_id', $target->id)
                        ->where('product_variant_id', $item->product_variant_id)
                        ->lockForUpdate()
                        ->first();

                    if ($existing) {
                        DB::table('cart_items')
                            ->where('id', $existing->id)
                            ->update([
                                'quantity' => min(20, $existing->quantity + $item->quantity),
                                'updated_at' => now(),
                            ]);

                        DB::table('cart_items')->where('id', $item->id)->delete();
                    } else {
                        DB::table('cart_items')
                            ->where('id', $item->id)
                            ->update([
                                'cart_id' => $target->id,
                                'updated_at' => now(),
                            ]);
                    }
                }

                DB::table('carts')->where('id', $duplicate->id)->delete();
            }

            DB::table('carts')
                ->where('id', $target->id)
                ->update([
                    'discount_id' => $discountId,
                    'updated_at' => now(),
                ]);
        }
    }
};
