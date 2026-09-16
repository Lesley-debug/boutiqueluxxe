<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_page', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title')->default('More than an accessory.');
            $table->text('hero_subtitle')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('philosophy_title')->default('Our Philosophy');
            $table->text('philosophy_text')->nullable();
            $table->string('approach_title')->default('Our Approach');
            $table->text('approach_text')->nullable();
            $table->string('contact_title')->default('Get in Touch');
            $table->text('contact_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('about_page');
    }
};
