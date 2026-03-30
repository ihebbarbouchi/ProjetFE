<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcmBibliotheque extends Model
{
    use SoftDeletes;

    protected $table = 'qcm_bibliotheque';

    protected $fillable = [
        'enseignant_id',
        'titre',
        'description',
        'slug',
        'discipline_id',
        'niveau_id',
        'fichier_path',
        'nb_questions',
        'nb_facile',
        'nb_moyen',
        'nb_difficile',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ── Relations ──────────────────────────────────────────────────

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'enseignant_id');
    }

    public function discipline(): BelongsTo
    {
        return $this->belongsTo(Discipline::class, 'discipline_id');
    }

    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class, 'niveau_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QcmQuestion::class, 'bibliotheque_id')->orderBy('ordre');
    }
}
