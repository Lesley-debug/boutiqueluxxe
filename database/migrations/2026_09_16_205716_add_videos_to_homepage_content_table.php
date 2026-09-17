<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_content', function (Blueprint $table) {
            $table->string('editorial_video')->nullable()->after('editorial_image');
            $table->string('watches_video')->nullable()->after('watches_image');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_content', function (Blueprint $table) {
            $table->dropColumn(['editorial_video', 'watches_video']);
        });
    }
};