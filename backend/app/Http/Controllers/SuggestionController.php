<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use App\Models\Discipline;
use App\Models\Niveau;
use App\Models\TypeRessource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuggestionController extends Controller
{
    /**
     * Créer une suggestion (enseignant → admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'type'   => 'required|in:discipline,niveau,type_ressource',
            'valeur' => 'required|string|max:255',
        ]);

        $suggestion = Suggestion::create([
            'user_id' => Auth::id(),
            'type'    => $request->type,
            'valeur'  => $request->valeur,
            'statut'  => 'pending',
        ]);

        return response()->json([
            'message'    => 'Suggestion envoyée avec succès.',
            'suggestion' => $suggestion,
        ], 201);
    }

    /**
     * Lister les suggestions (admin).
     * ?type=discipline|niveau|type_ressource
     */
    public function index(Request $request)
    {
        $query = Suggestion::with('user');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $suggestions = $query->latest()->get()->map(function ($s) {
            return [
                'id'         => $s->id,
                'type'       => $s->type,
                'valeur'     => $s->valeur,
                'statut'     => $s->statut,
                'proposed_by'=> $s->user ? ($s->user->prenom . ' ' . $s->user->nom_famille) : null,
                'created_at' => $s->created_at,
            ];
        });

        return response()->json($suggestions);
    }

    /**
     * Accepter une suggestion et créer l'entité correspondante.
     */
    public function accept($id)
    {
        $suggestion = Suggestion::findOrFail($id);

        switch ($suggestion->type) {
            case 'discipline':
                Discipline::firstOrCreate(['discipline' => $suggestion->valeur]);
                break;
            case 'niveau':
                Niveau::firstOrCreate(['niveau' => $suggestion->valeur]);
                break;
            case 'type_ressource':
                TypeRessource::firstOrCreate(['type_ressource' => $suggestion->valeur]);
                break;
        }

        $suggestion->statut = 'accepted';
        $suggestion->save();

        return response()->json(['message' => 'Suggestion acceptée et entité créée.', 'suggestion' => $suggestion]);
    }

    /**
     * Refuser une suggestion.
     */
    public function refuse($id)
    {
        $suggestion = Suggestion::findOrFail($id);
        $suggestion->statut = 'refused';
        $suggestion->save();

        return response()->json(['message' => 'Suggestion refusée.', 'suggestion' => $suggestion]);
    }

    /**
     * Modifier la valeur d'une suggestion (admin).
     */
    public function update(Request $request, $id)
    {
        $suggestion = Suggestion::findOrFail($id);

        $request->validate([
            'valeur' => 'required|string|max:255',
        ]);

        $suggestion->valeur = $request->valeur;
        $suggestion->save();

        return response()->json(['message' => 'Suggestion mise à jour.', 'suggestion' => $suggestion]);
    }
}
