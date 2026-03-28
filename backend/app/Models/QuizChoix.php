<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizChoix extends Model
{
    protected $table = 'quiz_choix';

    protected $fillable = [
        'question_id',
        'texte',
        'est_correct',
        'ordre',
    ];

    protected $casts = [
        'est_correct' => 'boolean',
    ];

    // ── Global scope : toujours trier par ordre ─────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->orderBy('ordre');
        });
    }

    // ── Relations ──────────────────────────────────────────────────

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
