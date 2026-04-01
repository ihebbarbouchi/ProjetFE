<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'valeur',
        'statut',
    ];

    public function user()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
