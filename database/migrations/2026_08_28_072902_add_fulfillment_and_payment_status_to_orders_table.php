<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('fulfillment_method')->default('delivery')->after('user_id'); // delivery | pickup
            $table->string('payment_status')->default('pending')->after('status'); // pending | paid
            $table->string('payment_reference')->nullable()->after('payment_status'); // customer-entered transaction ref, optional

            $table->string('shipping_address')->nullable()->change();
            $table->string('city')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['fulfillment_method', 'payment_status', 'payment_reference']);
        });
    }
};
