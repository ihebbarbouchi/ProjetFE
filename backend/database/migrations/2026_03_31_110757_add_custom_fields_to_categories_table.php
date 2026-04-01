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
        // No-op: custom fields are already included in create_categories_table migration
        if (!Schema::hasTable('categories')) return;
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'custom_discipline')) {
                $table->string('custom_discipline')->nullable();
                $table->string('custom_niveau')->nullable();
                $table->json('custom_types')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'custom_discipline')) {
                $table->dropColumn(['custom_discipline', 'custom_niveau', 'custom_types']);
            }
        });
    }
};
