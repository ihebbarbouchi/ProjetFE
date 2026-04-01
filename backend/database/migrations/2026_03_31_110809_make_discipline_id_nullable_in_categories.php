<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No-op: discipline_id is already nullable in create_categories_table migration
        if (!Schema::hasTable('categories')) return;
        Schema::table('categories', function (Blueprint $table) {
            // discipline_id is nullable from the start
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // No-op
        });
    }
};
