<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qcm_bibliotheque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('discipline_id')->nullable()->constrained('disciplines')->nullOnDelete();
            $table->foreignId('niveau_id')->nullable()->constrained('niveaux')->nullOnDelete();
            $table->string('fichier_path')->nullable();
            $table->integer('nb_questions')->default(0);
            $table->integer('nb_facile')->default(0);
            $table->integer('nb_moyen')->default(0);
            $table->integer('nb_difficile')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qcm_bibliotheque');
    }
};
