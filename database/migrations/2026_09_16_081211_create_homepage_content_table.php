<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_content', function (Blueprint $table) {
            $table->id();

            $table->string('editorial_title')->nullable();
            $table->text('editorial_subtitle')->nullable();
            $table->string('editorial_cta_text')->nullable();
            $table->string('editorial_cta_url')->nullable();
            $table->string('editorial_image')->nullable();

            $table->string('watches_title')->nullable();
            $table->text('watches_subtitle')->nullable();
            $table->string('watches_cta_text')->nullable();
            $table->string('watches_cta_url')->nullable();
            $table->string('watches_image')->nullable();

            $table->string('story_title')->nullable();
            $table->text('story_text')->nullable();
            $table->string('story_cta_text')->nullable();
            $table->string('story_image')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_content');
    }
};
