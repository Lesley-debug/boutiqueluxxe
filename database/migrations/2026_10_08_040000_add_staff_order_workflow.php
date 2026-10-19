<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->timestamp('stock_released_at')->nullable();
        });
        Schema::create('order_workflow_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name');
            $table->string('kind', 30);
            $table->string('from_value', 50)->nullable();
            $table->string('to_value', 50)->nullable();
            $table->text('note')->nullable();
            $table->json('snapshot');
            $table->json('metadata')->nullable();
            $table->string('email_status', 30)->default('not_requested');
            $table->unsignedInteger('email_attempts')->default(0);
            $table->timestamp('email_claimed_at')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->string('email_error')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'id']);
            $table->index(['email_status', 'id']);
        });
        // Existing orders are not changed or automatically restocked.
    }

    public function down(): void
    {
        Schema::dropIfExists('order_workflow_events');
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn('stock_released_at'));
    }
};
