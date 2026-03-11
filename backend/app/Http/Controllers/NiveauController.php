<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    public function index()
    {
        return response()->json(Niveau::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'niveau' => 'required|string|unique:niveaux,niveau',
        ]);

        $niveau = Niveau::create($validated);

        return response()->json($niveau, 201);
    }

    public function show($id)
    {
        return response()->json(Niveau::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $niveau = Niveau::findOrFail($id);
        $validated = $request->validate([
            'niveau' => 'string|unique:niveaux,niveau,' . $id,
        ]);

        $niveau->update($validated);

        return response()->json($niveau);
    }

    public function destroy($id)
    {
        $niveau = Niveau::findOrFail($id);
        $niveau->delete();
        return response()->json(['message' => 'Niveau supprimé avec succès']);
    }
}
