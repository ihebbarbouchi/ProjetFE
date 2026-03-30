<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcmChoix extends Model
{
    protected $table = 'qcm_choix';

    protected $fillable = [
        'question_id',
        'texte',
        'est_correct',
        'ordre',
    ];

    protected $casts = [
        'est_correct' => 'boolean',
    ];

    // ── Relations ──────────────────────────────────────────────────

    public function question(): BelongsTo
    {
        return $this->belongsTo(QcmQuestion::class, 'question_id');
    }
}
