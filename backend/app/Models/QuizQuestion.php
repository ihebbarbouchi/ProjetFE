<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    protected $table = 'quiz_questions';

    protected $fillable = [
        'quiz_id',
        'enonce',
        'difficulte',
        'points',
        'explication',
        'ordre',
    ];

    // ── Global scope : toujours trier par ordre ─────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->orderBy('ordre');
        });
    }

    // ── Relations ──────────────────────────────────────────────────

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function choix(): HasMany
    {
        return $this->hasMany(QuizChoix::class, 'question_id');
    }
}
