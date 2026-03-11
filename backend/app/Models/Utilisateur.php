<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role',
        'statut',
        'prenom',
        'nom_famille',
        'telephone',
        'adresse',
        'ville',
        'pays',
        'poste_actuel',
        'institution',
        'chemin_cv',
        'chemin_motivation',
        'chemin_cin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'mot_de_passe' => 'hashed',
    ];

    // Indiquer à Laravel d'utiliser 'mot_de_passe' au lieu de 'password' pour l'authentification
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }
}
