<?php

namespace App\Http\Controllers;

use App\Models\TypeRessource;
use Illuminate\Http\Request;

class TypeRessourceController extends Controller
{
    public function index()
    {
        return response()->json(TypeRessource::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_ressource' => 'required|string|unique:types_ressources,type_ressource',
        ]);

        $typeRessource = TypeRessource::create($validated);

        return response()->json($typeRessource, 201);
    }

    public function show($id)
    {
        return response()->json(TypeRessource::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $typeRessource = TypeRessource::findOrFail($id);
        $validated = $request->validate([
            'type_ressource' => 'string|unique:types_ressources,type_ressource,' . $id,
        ]);

        $typeRessource->update($validated);

        return response()->json($typeRessource);
    }

    public function destroy($id)
    {
        $typeRessource = TypeRessource::findOrFail($id);
        $typeRessource->delete();
        return response()->json(['message' => 'Type de ressource supprimé avec succès']);
    }
}
