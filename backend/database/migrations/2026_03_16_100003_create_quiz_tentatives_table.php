<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_tentatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('apprenant_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->integer('score_total')->default(0);
            $table->integer('pourcentage')->default(0);
            $table->boolean('est_reussi')->default(false);
            $table->integer('temps_passe')->nullable()->comment('Secondes écoulées');
            $table->timestamp('completee_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_tentatives');
    }
};
