<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discipline;
use App\Models\Niveau;
use App\Models\QcmBibliotheque;
use App\Models\QcmChoix;
use App\Models\QcmQuestion;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QcmBibliothequeController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Liste des QCM de la bibliothèque de l'enseignant
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/qcm-bibliotheque
     * Retourne tous les QCM actifs de l'enseignant connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $qcms = QcmBibliotheque::where('enseignant_id', $request->user()->id)
            ->with(['discipline', 'niveau'])
            ->withCount('questions')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($qcms);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upload et sauvegarde d'un nouveau QCM depuis un JSON
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/qcm-bibliotheque
     * Upload un fichier JSON, le parse, valide et sauvegarde en BDD.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fichier'       => 'required|file|max:5120',
            'titre'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'discipline_id' => 'nullable|exists:disciplines,id',
            'niveau_id'     => 'nullable|exists:niveaux,id',
        ]);

        try {
            $file    = $request->file('fichier');
            $content = file_get_contents($file->getRealPath());

            // Décodage JSON
            $questionsData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['message' => 'Le fichier n\'est pas un JSON valide.'], 422);
            }

            if (!is_array($questionsData) || empty($questionsData)) {
                return response()->json(['message' => 'Le JSON doit être un tableau contenant au moins une question.'], 422);
            }

            // Validation structurelle
            foreach ($questionsData as $i => $q) {
                $num = $i + 1;

                if (empty($q['enonce'])) {
                    return response()->json(['message' => "Question #{$num} : le champ 'enonce' est manquant."], 422);
                }

                if (!isset($q['choix']) || !is_array($q['choix']) || count($q['choix']) < 2) {
                    return response()->json(['message' => "Question #{$num} : au moins 2 choix sont requis."], 422);
                }

                $nbCorrects = count(array_filter($q['choix'], fn($c) => !empty($c['est_correct'])));
                if ($nbCorrects < 1) {
                    return response()->json(['message' => "Question #{$num} : au moins 1 bonne réponse est requise."], 422);
                }
            }

            // Calcul des stats de difficulté
            $nbFacile    = 0;
            $nbMoyen     = 0;
            $nbDifficile = 0;

            foreach ($questionsData as $q) {
                $diff = $q['difficulte'] ?? 'moyen';
                if ($diff === 'facile')    $nbFacile++;
                elseif ($diff === 'difficile') $nbDifficile++;
                else $nbMoyen++;
            }

            // Sauvegarde du fichier json
            $filePath = $file->store('qcm-sources', 'local');

            // Transaction BDD
            $qcm = DB::transaction(function () use ($validated, $questionsData, $request, $filePath, $nbFacile, $nbMoyen, $nbDifficile) {
                $qcm = QcmBibliotheque::create([
                    'enseignant_id' => $request->user()->id,
                    'titre'         => $validated['titre'],
                    'description'   => $validated['description'] ?? null,
                    'slug'          => Str::slug($validated['titre']) . '-' . uniqid(),
                    'discipline_id' => $validated['discipline_id'] ?? null,
                    'niveau_id'     => $validated['niveau_id'] ?? null,
                    'fichier_path'  => $filePath,
                    'nb_questions'  => count($questionsData),
                    'nb_facile'     => $nbFacile,
                    'nb_moyen'      => $nbMoyen,
                    'nb_difficile'  => $nbDifficile,
                    'is_active'     => true,
                ]);

                foreach ($questionsData as $ordre => $qData) {
                    $question = QcmQuestion::create([
                        'bibliotheque_id' => $qcm->id,
                        'enonce'          => $qData['enonce'],
                        'explication'     => $qData['explication'] ?? null,
                        'difficulte'      => in_array($qData['difficulte'] ?? '', ['facile', 'moyen', 'difficile'])
                                                ? $qData['difficulte']
                                                : 'moyen',
                        'points'          => $qData['points'] ?? 1,
                        'ordre'           => $ordre,
                    ]);

                    foreach ($qData['choix'] as $cOrdre => $choix) {
                        QcmChoix::create([
                            'question_id' => $question->id,
                            'texte'       => $choix['texte'],
                            'est_correct' => (bool)($choix['est_correct'] ?? false),
                            'ordre'       => $cOrdre,
                        ]);
                    }
                }

                return $qcm;
            });

            return response()->json([
                'message' => 'QCM ajouté à votre bibliothèque avec succès.',
                'qcm'     => $qcm->load(['questions.choix', 'discipline', 'niveau']),
            ], 201);

        } catch (\Exception $e) {
            Log::error('QCM store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de l\'enregistrement : ' . $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Détail d'un QCM
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/qcm-bibliotheque/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $qcm = QcmBibliotheque::where('enseignant_id', $request->user()->id)
            ->with(['questions.choix', 'discipline', 'niveau'])
            ->findOrFail($id);

        return response()->json($qcm);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Suppression (soft delete)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/qcm-bibliotheque/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $qcm = QcmBibliotheque::where('enseignant_id', $request->user()->id)->findOrFail($id);
        $qcm->delete(); // soft delete

        return response()->json(['message' => 'QCM supprimé de la bibliothèque.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Importer un QCM → créer un Quiz
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/qcm-bibliotheque/{id}/importer
     * Crée un Quiz (brouillon) depuis un QCM de la bibliothèque.
     */
    public function importer(Request $request, int $id): JsonResponse
    {
        $qcm = QcmBibliotheque::where('enseignant_id', $request->user()->id)
            ->with('questions.choix')
            ->findOrFail($id);

        $validated = $request->validate([
            'titre'         => 'required|string|max:255',
            'temps_limite'  => 'nullable|integer|min:5|max:180',
            'score_passage' => 'integer|min:0|max:100',
        ]);

        try {
            $quiz = DB::transaction(function () use ($validated, $qcm, $request) {
                $quiz = Quiz::create([
                    'enseignant_id'     => $request->user()->id,
                    'titre'             => $validated['titre'],
                    'slug'              => Str::slug($validated['titre']) . '-' . uniqid(),
                    'temps_limite'      => $validated['temps_limite'] ?? null,
                    'score_passage'     => $validated['score_passage'] ?? 50,
                    'melange_questions' => true,
                    'melange_reponses'  => true,
                    'status'            => 'brouillon',
                ]);

                foreach ($qcm->questions as $ordre => $qcmQuestion) {
                    $quizQuestion = $quiz->questions()->create([
                        'enonce'      => $qcmQuestion->enonce,
                        'difficulte'  => $qcmQuestion->difficulte,
                        'points'      => $qcmQuestion->points,
                        'explication' => $qcmQuestion->explication,
                        'ordre'       => $ordre,
                    ]);

                    foreach ($qcmQuestion->choix as $cOrdre => $choix) {
                        $quizQuestion->choix()->create([
                            'texte'       => $choix->texte,
                            'est_correct' => $choix->est_correct,
                            'ordre'       => $cOrdre,
                        ]);
                    }
                }

                return $quiz;
            });

            return response()->json([
                'message' => 'Quiz créé depuis la bibliothèque. Révisez avant de publier.',
                'quiz'    => $quiz->load('questions.choix'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('QCM import to quiz failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de l\'import : ' . $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lister les disciplines et niveaux (pour le formulaire d'upload)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/qcm-bibliotheque/meta
     * Retourne les disciplines et niveaux disponibles.
     */
    public function meta(): JsonResponse
    {
        return response()->json([
            'disciplines' => Discipline::all(['id', 'discipline']),
            'niveaux'     => Niveau::all(['id', 'niveau']),
        ]);
    }
}
