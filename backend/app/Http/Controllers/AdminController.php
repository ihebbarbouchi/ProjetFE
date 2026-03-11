<?php

namespace App\Http\Controllers;

use App\Mail\AccountStatusChanged;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    /**
     * Get all users.
     */
    public function users()
    {
        $users = Utilisateur::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    /**
     * Get all teacher applications/accounts.
     */
    public function pendingTeachers()
    {
        $teachers = Utilisateur::where('role', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($teachers);
    }

    /**
     * Approve a user (teacher or student).
     */
    public function approveUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        $user->statut = 'active';
        $user->save();

        // Envoyer un email de confirmation à l'utilisateur
        try {
            Mail::to($user->email)->send(new AccountStatusChanged($user, 'active'));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email approbation: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Utilisateur approuvé avec succès. Un email de confirmation a été envoyé.']);
    }

    /**
     * Reject a user (teacher or student) and delete the account.
     */
    public function rejectUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        
        // Stocker l'email pour l'envoi après suppression ou envoyer avant suppression
        $userEmail = $user->email;
        $userName = $user->nom;

        // Envoyer un email de rejet à l'utilisateur avant de supprimer
        try {
            Mail::to($userEmail)->send(new AccountStatusChanged($user, 'rejected'));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email rejet: ' . $e->getMessage());
        }

        // Supprimer l'utilisateur de la base de données
        $user->delete();

        return response()->json([
            'message' => "L'utilisateur $userName a été rejeté et supprimé définitivement. Un email de notification a été envoyé."
        ]);
    }

    /**
     * Reset user status to pending.
     */
    public function resetUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        $user->statut = 'pending';
        $user->save();

        return response()->json(['message' => 'Statut remis en attente avec succès']);
    }

    /**
     * Create a new user manually (Admin only).
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:utilisateurs',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,teacher,super-admin',
        ]);

        $user = Utilisateur::create([
            'nom' => $validated['nom'] . ' ' . $validated['prenom'],
            'nom_famille' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'mot_de_passe' => $validated['password'],
            'role' => $validated['role'],
            'statut' => 'active',
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:utilisateurs,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:student,teacher,super-admin',
        ]);

        $user->nom = $validated['nom'] . ' ' . $validated['prenom'];
        $user->nom_famille = $validated['nom'];
        $user->prenom = $validated['prenom'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->mot_de_passe = $validated['password'];
        }

        $user->save();

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    // ── Méthodes dépréciées gardées pour compatibilité descendante ──

    /** @deprecated Utiliser approveUser() */
    public function approveTeacher($id) { return $this->approveUser($id); }

    /** @deprecated Utiliser rejectUser() */
    public function rejectTeacher($id) { return $this->rejectUser($id); }

    /** @deprecated Utiliser resetUser() */
    public function resetTeacher($id) { return $this->resetUser($id); }
}
