<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Discipline;
use App\Models\Niveau;

use App\Models\Notification;
use App\Models\TypeRessource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class CategoryController extends Controller
{
    /**
     * Liste toutes les catégories selon le statut.
     * ?status=all|approved|pending|rejected
     */
    public function index(Request $request)
    {
        $query = Categorie::with(['discipline', 'level', 'resourceTypes', 'user']);

        $status = $request->query('status', 'approved');

        if ($status !== 'all') {
            $query->where('statut', $status);
        }

        $categories = $query->latest()->get();

        $mapped = $categories->map(function ($cat) {
            return [
                'id' => $cat->id,
                'code' => $cat->code,
                'description' => $cat->description,
                'statut' => $cat->statut,
                'discipline_id' => $cat->discipline_id,
                'niveau_id' => $cat->niveau_id,
                'discipline_name' => $cat->discipline?->discipline ?? $cat->custom_discipline,
                'niveau_name' => $cat->level?->niveau ?? $cat->custom_niveau,
                'custom_discipline' => $cat->custom_discipline,
                'custom_niveau' => $cat->custom_niveau,
                'custom_types' => $cat->custom_types,
                'resource_types' => $cat->resourceTypes,
                'proposed_by' => $cat->user ? ($cat->user->prenom . ' ' . $cat->user->nom_famille) : null,
                'user_id' => $cat->user_id,
                'created_at' => $cat->created_at,
            ];
        });

        return response()->json($mapped);
    }

    /**
     * Créer une catégorie (suggestion de l'enseignant ou création directe de l'admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:categories,code',
            'discipline_id' => 'nullable|integer|exists:disciplines,id',
            'custom_discipline' => 'nullable|string',
            'niveau_id' => 'nullable|integer|exists:niveaux,id',
            'custom_niveau' => 'nullable|string',
            'description' => 'nullable|string',
            'types' => 'nullable|array',
            'types.*' => 'integer|exists:types_ressources,id',
            'custom_types' => 'nullable|array',
            'custom_types.*' => 'string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB limit
        ]);

        // Au moins une discipline est requise
        if (empty($request->discipline_id) && empty($request->custom_discipline)) {
            return response()->json(['message' => 'Une discipline ou une discipline personnalisée est requise.'], 422);
        }

        $user = Auth::user();
        $isSuperAdmin = $user && $user->role === 'super-admin';
        
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('category_images', 'public');
        }

        $categorie = Categorie::create([
            'user_id' => $user->id,
            'discipline_id' => $request->discipline_id,
            'niveau_id' => $request->niveau_id,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'statut' => $isSuperAdmin ? 'approved' : 'pending',
            'custom_discipline' => $request->custom_discipline,
            'custom_niveau' => $request->custom_niveau,
            'custom_types' => $request->custom_types,
            'image_path' => $imagePath,
        ]);

        // Attacher les types existants
        if (!empty($request->types)) {
            $categorie->resourceTypes()->attach($request->types);
        }

        // Si super-admin, résoudre immédiatement les champs custom
        if ($isSuperAdmin) {
            $this->resolveCustomFields($categorie);
        }

        return response()->json([
            'message' => $isSuperAdmin ? 'Catégorie créée avec succès.' : 'Suggestion envoyée. En attente d\'approbation.',
            'categorie' => $categorie->fresh(['discipline', 'level', 'resourceTypes']),
        ], 201);
    }

    /**
     * Approuver une catégorie.
     */
    public function approve($id)
    {
        $categorie = Categorie::findOrFail($id);

        $this->resolveCustomFields($categorie);

        $categorie->statut = 'approved';
        $categorie->save();


        // Notification in-app au proposeur
        if ($categorie->user_id) {
            try {
                Notification::notifier(
                    $categorie->user_id,
                    'categorie_acceptee',
                    'Catégorie approuvée ✅',
                    "Votre suggestion de catégorie \"" . strtoupper($categorie->code) . "\" a été approuvée par l'administrateur. Elle est maintenant disponible sur la plateforme."
                );
            } catch (\Exception $e) {
                \Log::error('Erreur notification catégorie approuvée: ' . $e->getMessage());
            }
        }

        // Email au proposeur

        if ($categorie->user && $categorie->user->email) {
            try {
                Mail::raw(
                    "Bonjour,\n\nVotre suggestion de catégorie (code: {$categorie->code}) a été approuvée.\n\nCordialement,\nL'équipe EduShare",
                    function ($message) use ($categorie) {
                        $message->to($categorie->user->email)
                            ->subject('Votre catégorie a été approuvée');
                    }
                );
            } catch (\Exception $e) {
                // Ne pas bloquer si l'email échoue
            }
        }

        return response()->json(['message' => 'Catégorie approuvée avec succès.', 'categorie' => $categorie]);
    }

    /**
     * Refuser (et supprimer) une catégorie.
     */
    public function reject($id)
    {
        $categorie = Categorie::findOrFail($id);


        // Notification in-app au proposeur
        if ($categorie->user_id) {
            try {
                Notification::notifier(
                    $categorie->user_id,
                    'categorie_refusee',
                    'Catégorie refusée',
                    "Votre suggestion de catégorie \"" . strtoupper($categorie->code) . "\" a été refusée par l'administrateur. Vous pouvez soumettre une nouvelle suggestion avec des corrections."
                );
            } catch (\Exception $e) {
                \Log::error('Erreur notification catégorie refusée: ' . $e->getMessage());
            }
        }

        // Email au proposeur

        if ($categorie->user && $categorie->user->email) {
            try {
                Mail::raw(
                    "Bonjour,\n\nVotre suggestion de catégorie (code: {$categorie->code}) a été refusée.\n\nCordialement,\nL'équipe EduShare",
                    function ($message) use ($categorie) {
                        $message->to($categorie->user->email)
                            ->subject('Votre catégorie a été refusée');
                    }
                );
            } catch (\Exception $e) {
                // Ne pas bloquer si l'email échoue
            }
        }

        $categorie->delete();

        return response()->json(['message' => 'Catégorie refusée et supprimée.']);
    }

    /**
     * Supprimer une catégorie approuvée.
     */
    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->delete();
        return response()->json(['message' => 'Catégorie supprimée avec succès.']);
    }

    /**
     * Résoudre les champs custom en créant les entités manquantes.
     */
    private function resolveCustomFields(Categorie $categorie): void
    {
        // Discipline personnalisée
        if ($categorie->custom_discipline && !$categorie->discipline_id) {
            $discipline = Discipline::firstOrCreate(['discipline' => $categorie->custom_discipline]);
            $categorie->discipline_id = $discipline->id;
            $categorie->custom_discipline = null;
        }

        // Niveau personnalisé
        if ($categorie->custom_niveau && !$categorie->niveau_id) {
            $niveau = Niveau::firstOrCreate(['niveau' => $categorie->custom_niveau]);
            $categorie->niveau_id = $niveau->id;
            $categorie->custom_niveau = null;
        }

        // Types de ressources personnalisés
        if (!empty($categorie->custom_types)) {
            foreach ($categorie->custom_types as $typeNom) {
                $type = TypeRessource::firstOrCreate(['type_ressource' => $typeNom]);
                $categorie->resourceTypes()->syncWithoutDetaching([$type->id]);
            }
            $categorie->custom_types = null;
        }

        $categorie->save();
    }
}
