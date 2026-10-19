<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('contact_messages') || Schema::hasTable('contact_events')) { throw new RuntimeException('Unexpected existing contact table. Stop and reconcile migration state before continuing.'); }
        Schema::create('contact_messages', function (Blueprint $t) {
            $t->id(); $t->string('name',120); $t->string('email'); $t->string('subject',160); $t->text('message');
            $t->string('status',20)->default('open'); $t->unsignedInteger('workflow_version')->default(0); $t->timestamps(); $t->index(['status','id']);
        });
        Schema::create('contact_events', function (Blueprint $t) {
            $t->id(); $t->foreignId('contact_message_id')->constrained('contact_messages')->cascadeOnDelete();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete(); $t->string('actor_name');
            $t->string('kind',20); $t->text('body')->nullable(); $t->json('snapshot')->nullable(); $t->json('metadata')->nullable();
            $t->string('email_status',30)->default('not_requested'); $t->unsignedInteger('email_attempts')->default(0);
            $t->timestamp('email_claimed_at')->nullable(); $t->timestamp('email_sent_at')->nullable(); $t->string('email_error')->nullable();
            $t->timestamps(); $t->index(['contact_message_id','id']); $t->index(['email_status','id']);
        });
    }
    public function down(): void { Schema::dropIfExists('contact_events'); Schema::dropIfExists('contact_messages'); }
};
