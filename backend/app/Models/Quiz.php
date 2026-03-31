<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quiz extends Model
{
    protected $table = 'quizzes';

    protected $fillable = [
        'enseignant_id',
        'ressource_id',
        'titre',
        'slug',
        'code',
        'description',
        'temps_limite',
        'score_passage',
        'melange_questions',
        'melange_reponses',
        'afficher_correction',
        'nb_tentatives_max',
        'status',
        'publie_le',
        'expire_le',
    ];

    protected $casts = [
        'melange_questions'   => 'boolean',
        'melange_reponses'    => 'boolean',
        'afficher_correction' => 'boolean',
        'publie_le'           => 'datetime',
        'expire_le'           => 'datetime',
    ];

    // ── Relations ──────────────────────────────────────────────────

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'enseignant_id');
    }

    public function ressource(): BelongsTo
    {
        return $this->belongsTo(Resource::class, 'ressource_id');
    }

    /** Relation de base (nécessaire pour les comptages, sum, etc.) */
    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id');
    }

    public function tentatives(): HasMany
    {
        return $this->hasMany(QuizTentative::class, 'quiz_id');
    }

    // ── Accessors ──────────────────────────────────────────────────

    /** Calcule le total de points possible. */
    public function getTotalPointsAttribute(): int
    {
        return $this->questions()->sum('points');
    }
}
