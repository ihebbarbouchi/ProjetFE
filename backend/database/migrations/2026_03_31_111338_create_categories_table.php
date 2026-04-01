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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('utilisateurs')->onDelete('set null');
            $table->foreignId('discipline_id')->nullable()->constrained('disciplines')->onDelete('set null');
            $table->foreignId('niveau_id')->nullable()->constrained('niveaux')->onDelete('set null');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('statut')->default('pending'); // pending | approved | rejected
            $table->string('custom_discipline')->nullable();
            $table->string('custom_niveau')->nullable();
            $table->json('custom_types')->nullable();
            $table->timestamps();
        });

        // Pivot table for categories <-> types_ressources
        Schema::create('categorie_type_ressource', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categorie_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('type_ressource_id')->constrained('types_ressources')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categorie_type_ressource');
        Schema::dropIfExists('categories');
    }
};
