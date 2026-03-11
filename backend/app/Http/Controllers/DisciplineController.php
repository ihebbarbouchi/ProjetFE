<?php

namespace App\Http\Controllers;

use App\Models\Discipline;
use Illuminate\Http\Request;

class DisciplineController extends Controller
{
    public function index()
    {
        return response()->json(Discipline::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'discipline' => 'required|string|unique:disciplines,discipline',
        ]);

        $discipline = Discipline::create($validated);

        return response()->json($discipline, 201);
    }

    public function show($id)
    {
        return response()->json(Discipline::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $discipline = Discipline::findOrFail($id);
        $validated = $request->validate([
            'discipline' => 'string|unique:disciplines,discipline,' . $id,
        ]);

        $discipline->update($validated);

        return response()->json($discipline);
    }

    public function destroy($id)
    {
        $discipline = Discipline::findOrFail($id);
        $discipline->delete();
        return response()->json(['message' => 'Discipline supprimée avec succès']);
    }
}
