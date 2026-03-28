<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('ressource_id')->nullable()->constrained('resources')->nullOnDelete();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('temps_limite')->nullable()->comment('En minutes');
            $table->integer('score_passage')->default(50)->comment('Pourcentage minimum pour réussir');
            $table->boolean('melange_questions')->default(true);
            $table->boolean('melange_reponses')->default(true);
            $table->boolean('afficher_correction')->default(true)->comment('Montrer correction après soumission');
            $table->integer('nb_tentatives_max')->default(1)->comment('0 = illimité');
            $table->enum('status', ['brouillon', 'publie', 'archive'])->default('brouillon');
            $table->timestamp('publie_le')->nullable();
            $table->timestamp('expire_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
