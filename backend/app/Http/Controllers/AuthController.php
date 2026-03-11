<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request) {
        $data = $request->validate([
            'prenom'           => 'required|string',
            'nom_famille'      => 'required|string',
            'email'            => 'required|email|unique:utilisateurs',
            'mot_de_passe'     => 'required|min:8',
            'role'             => 'sometimes|in:student,teacher,super-admin',
            'telephone'        => 'nullable|string',
            'adresse'          => 'nullable|string',
            'ville'            => 'nullable|string',
            'pays'             => 'nullable|string',
            'poste_actuel'     => 'nullable|string',
            'institution'      => 'nullable|string',
            'cv'               => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'motivation'       => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'cin'              => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $userData = [
            'nom'              => $data['prenom'] . ' ' . $data['nom_famille'],
            'prenom'           => $data['prenom'],
            'nom_famille'      => $data['nom_famille'],
            'email'            => $data['email'],
            'mot_de_passe'     => $data['mot_de_passe'],
            'role'             => $data['role'] ?? 'student',
            'statut'           => (($data['role'] ?? 'student') === 'super-admin') ? 'active' : 'pending',
            'telephone'        => $data['telephone'] ?? null,
            'adresse'          => $data['adresse'] ?? null,
            'ville'            => $data['ville'] ?? null,
            'pays'             => $data['pays'] ?? null,
            'poste_actuel'     => $data['poste_actuel'] ?? null,
            'institution'      => $data['institution'] ?? null,
        ];

        if ($request->hasFile('cv')) {
            $userData['chemin_cv'] = $request->file('cv')->store('cvs', 'public');
        }
        if ($request->hasFile('motivation')) {
            $userData['chemin_motivation'] = $request->file('motivation')->store('motivations', 'public');
        }
        if ($request->hasFile('cin')) {
            $userData['chemin_cin'] = $request->file('cin')->store('cins', 'public');
        }

        $user = Utilisateur::create($userData);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token
        ], 201);
    }

    public function completeProfile(Request $request) {
        $user = $request->user();
        
        $data = $request->validate([
            'telephone'        => 'nullable|string',
            'ville'            => 'nullable|string',
            'pays'             => 'nullable|string',
            'poste_actuel'     => 'nullable|string',
            'institution'      => 'nullable|string',
            'cv'               => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'motivation'       => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'cin'              => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $updateData = [
            'telephone'        => $data['telephone'] ?? $user->telephone,
            'ville'            => $data['ville'] ?? $user->ville,
            'pays'             => $data['pays'] ?? $user->pays,
            'poste_actuel'     => $data['poste_actuel'] ?? $user->poste_actuel,
            'institution'      => $data['institution'] ?? $user->institution,
        ];

        if ($request->hasFile('cv')) {
            $updateData['chemin_cv'] = $request->file('cv')->store('cvs', 'public');
        }
        if ($request->hasFile('motivation')) {
            $updateData['chemin_motivation'] = $request->file('motivation')->store('motivations', 'public');
        }
        if ($request->hasFile('cin')) {
            $updateData['chemin_cin'] = $request->file('cin')->store('cins', 'public');
        }

        $user->update($updateData);

        return response()->json(['message' => 'Profile completed successfully', 'user' => $user]);
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        
        $data = $request->validate([
            'prenom'           => 'required|string',
            'nom_famille'      => 'required|string',
            'email'            => 'required|email|unique:utilisateurs,email,' . $user->id,
            'telephone'        => 'nullable|string',
            'adresse'          => 'nullable|string',
            'ville'            => 'nullable|string',
            'pays'             => 'nullable|string',
            'poste_actuel'     => 'nullable|string',
            'institution'      => 'nullable|string',
            'mot_de_passe'     => 'nullable|min:8',
        ]);

        $updateData = [
            'nom'              => $data['prenom'] . ' ' . $data['nom_famille'],
            'prenom'           => $data['prenom'],
            'nom_famille'      => $data['nom_famille'],
            'email'            => $data['email'],
            'telephone'        => $data['telephone'] ?? null,
            'adresse'          => $data['adresse'] ?? null,
            'ville'            => $data['ville'] ?? null,
            'pays'             => $data['pays'] ?? null,
            'poste_actuel'     => $data['poste_actuel'] ?? null,
            'institution'      => $data['institution'] ?? null,
        ];

        if (!empty($data['mot_de_passe'])) {
            $updateData['mot_de_passe'] = $data['mot_de_passe'];
        }

        $user->update($updateData);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }

    public function changePassword(Request $request) {
        $user = $request->user();

        $data = $request->validate([
            'mot_de_passe_actuel'   => 'required|string',
            'nouveau_mot_de_passe'  => 'required|min:8|confirmed',
        ]);

        // Verify current password
        if (!password_verify($data['mot_de_passe_actuel'], $user->mot_de_passe)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        $user->update(['mot_de_passe' => $data['nouveau_mot_de_passe']]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    public function login(Request $request) {
        $request->validate([
            'email'    => 'required|email',
            'mot_de_passe' => 'required',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Ce compte n\'existe pas.'], 404);
        }

        // Laravel expects 'password' key in credentials for Auth::attempt
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->mot_de_passe])) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 401);
        }

        $user  = Auth::user();
        $user->tokens()->delete(); // Revoke all previous tokens for single session security
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function me(Request $request) {
        return response()->json($request->user());
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
