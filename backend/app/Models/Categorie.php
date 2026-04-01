<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'user_id',
        'discipline_id',
        'niveau_id',
        'code',
        'description',
        'statut',
        'custom_discipline',
        'custom_niveau',
        'custom_types',
    ];

    protected $casts = [
        'custom_types' => 'array',
    ];

    public function discipline()
    {
        return $this->belongsTo(Discipline::class);
    }

    public function level()
    {
        return $this->belongsTo(Niveau::class, 'niveau_id');
    }

    public function resourceTypes()
    {
        return $this->belongsToMany(TypeRessource::class, 'categorie_type_ressource', 'categorie_id', 'type_ressource_id');
    }

    public function user()
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }
}
