<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type',
        'chemin_fichier',
        'utilisateur_id',
        'categorie_id',
        'visibilite',
        'image_path'
    ];

    public function user()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function category()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }
}
