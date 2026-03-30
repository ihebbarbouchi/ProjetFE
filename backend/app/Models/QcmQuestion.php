<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcmQuestion extends Model
{
    use SoftDeletes;

    protected $table = 'qcm_questions';

    protected $fillable = [
        'bibliotheque_id',
        'enonce',
        'explication',
        'difficulte',
        'points',
        'ordre',
    ];

    // ── Relations ──────────────────────────────────────────────────

    public function bibliotheque(): BelongsTo
    {
        return $this->belongsTo(QcmBibliotheque::class, 'bibliotheque_id');
    }

    public function choix(): HasMany
    {
        return $this->hasMany(QcmChoix::class, 'question_id')->orderBy('ordre');
    }
}
