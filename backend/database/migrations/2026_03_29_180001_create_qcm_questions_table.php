<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qcm_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bibliotheque_id')->constrained('qcm_bibliotheque')->onDelete('cascade');
            $table->text('enonce');
            $table->text('explication')->nullable();
            $table->enum('difficulte', ['facile', 'moyen', 'difficile'])->default('moyen');
            $table->integer('points')->default(1);
            $table->integer('ordre')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qcm_questions');
    }
};
