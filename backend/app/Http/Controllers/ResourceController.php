<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ResourceController extends Controller
{
    /**
     * List all public resources for a specific category.
     */
    public function indexByCategory($cat_id)
    {
        $resources = Resource::where('categorie_id', $cat_id)
            ->where('visibilite', 'public')
            ->with(['user:id,nom,prenom', 'category:id,code'])
            ->latest()
            ->get();

        return response()->json($resources);
    }

    /**
     * List resources created by the authenticated user.
     */
    public function myResources()
    {
        $resources = Resource::where('utilisateur_id', Auth::id())
            ->with(['category:id,code'])
            ->latest()
            ->get();

        return response()->json($resources);
    }

    /**
     * Store a new resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
            'visibilite' => 'required|in:public,private',
            'fichier' => 'required|file|mimes:pdf|max:10240',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB limit
        ]);

        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('resources', 'public');
            
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('resource_images', 'public');
            }

            $resource = Resource::create([
                'titre' => $request->titre,
                'description' => $request->description,
                'type' => 'PDF',
                'chemin_fichier' => $path,
                'utilisateur_id' => Auth::id(),
                'categorie_id' => $request->categorie_id,
                'visibilite' => $request->visibilite,
                'image_path' => $imagePath,
            ]);

            return response()->json([
                'message' => 'Ressource enregistrée avec succès.',
                'resource' => $resource
            ], 201);
        }

        return response()->json(['message' => 'Fichier non fourni.'], 400);
    }

    /**
     * Delete a resource.
     */
    public function destroy($id)
    {
        $resource = Resource::where('id', $id)
            ->where('utilisateur_id', Auth::id())
            ->firstOrFail();

        // Delete files from storage
        if ($resource->chemin_fichier) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($resource->chemin_fichier);
        }
        if ($resource->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($resource->image_path);
        }

        $resource->delete();

        return response()->json(['message' => 'Ressource supprimée.']);
    }
}
