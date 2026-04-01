<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'utilisateur_id',
        'type',
        'titre',
        'message',
        'lu',
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    // ── Relations ──────────────────────────────────────────────────
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    // ── Scopes ─────────────────────────────────────────────────────
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('utilisateur_id', $userId);
    }

    // ── Factory helper ─────────────────────────────────────────────
    public static function notifier(int $userId, string $type, string $titre, string $message): self
    {
        return static::create([
            'utilisateur_id' => $userId,
            'type'           => $type,
            'titre'          => $titre,
            'message'        => $message,
            'lu'             => false,
        ]);
    }
}
