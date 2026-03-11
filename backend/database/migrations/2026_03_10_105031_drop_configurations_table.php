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
        Schema::dropIfExists('configurations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->string('resource_type')->nullable();
            $table->string('resource_code')->nullable();
            $table->boolean('allows_attachment')->default(false);
            $table->string('discipline')->nullable();
            $table->string('niveau')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
};
