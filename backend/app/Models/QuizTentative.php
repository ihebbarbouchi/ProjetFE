<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizTentative extends Model
{
    protected $table = 'quiz_tentatives';

    protected $fillable = [
        'quiz_id',
        'apprenant_id',
        'score',
        'score_total',
        'pourcentage',
        'est_reussi',
        'temps_passe',
        'completee_le',
    ];

    protected $casts = [
        'est_reussi'   => 'boolean',
        'completee_le' => 'datetime',
    ];

    // ── Relations ──────────────────────────────────────────────────

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function apprenant(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'apprenant_id');
    }
}
