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
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('prenom')->nullable();
            $table->string('nom_famille')->nullable();
            $table->string('telephone')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->nullable();
            $table->string('poste_actuel')->nullable();
            $table->string('institution')->nullable();
            $table->string('chemin_cv')->nullable();
            $table->string('chemin_motivation')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn([
                'prenom',
                'nom_famille',
                'telephone',
                'ville',
                'pays',
                'poste_actuel',
                'institution',
                'chemin_cv',
                'chemin_motivation'
            ]);
        });
    }
};
