<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizTentative;
use App\Services\DocumentTextExtractor;
use App\Services\QuizGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class QuizIaController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Enseignant : Génération IA
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/quiz/generer
     * Upload un document, génère un quiz via Gemini et le sauvegarde en BDD.
     */
    public function generer(Request $request): JsonResponse
    {
        // Allow up to 5 minutes for AI generation + retries
        set_time_limit(300);

        $validated = $request->validate([
            'fichier'       => 'required|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
            'titre'         => 'required|string|max:255',
            'nb_questions'  => 'integer|min:3|max:30',
            'temps_limite'  => 'nullable|integer|min:5|max:180',
            'score_passage' => 'integer|min:0|max:100',
            'ressource_id'  => 'nullable|exists:resources,id',
        ]);

        try {
            // 1. Sauvegarder le fichier
            $file     = $request->file('fichier');
            $path     = $file->store('quiz-sources', 'local');
            $fullPath = storage_path('app/' . $path);

            // 2. Extraire le texte
            $extractor = app(DocumentTextExtractor::class);
            $texte     = $extractor->extract($fullPath, $file->getMimeType());

            if (mb_strlen(trim($texte)) < 100) {
                return response()->json([
                    'message' => 'Le document est trop court ou illisible (moins de 100 caractères extraits).'
                ], 422);
            }

            // 3. Générer via Gemini
            $generator   = app(QuizGeneratorService::class);
            $questionsIA = $generator->genererQuiz($texte, (int)($validated['nb_questions'] ?? 10));

            // 4. Sauvegarder en BDD dans une transaction
            $quiz = DB::transaction(function () use ($validated, $questionsIA, $request) {
                $quiz = Quiz::create([
                    'enseignant_id'     => $request->user()->id,
                    'ressource_id'      => $validated['ressource_id'] ?? null,
                    'titre'             => $validated['titre'],
                    'slug'              => Str::slug($validated['titre']) . '-' . uniqid(),
                    'temps_limite'      => $validated['temps_limite'] ?? null,
                    'score_passage'     => $validated['score_passage'] ?? 50,
                    'melange_questions' => true,
                    'melange_reponses'  => true,
                    'status'            => 'brouillon',
                ]);

                foreach ($questionsIA as $ordre => $qData) {
                    $question = $quiz->questions()->create([
                        'enonce'      => $qData['enonce'],
                        'difficulte'  => $qData['difficulte'] ?? 'moyen',
                        'points'      => $qData['points'] ?? 1,
                        'explication' => $qData['explication'] ?? null,
                        'ordre'       => $ordre,
                    ]);

                    foreach ($qData['choix'] as $cOrdre => $choix) {
                        $question->choix()->create([
                            'texte'       => $choix['texte'],
                            'est_correct' => (bool) $choix['est_correct'],
                            'ordre'       => $cOrdre,
                        ]);
                    }
                }

                return $quiz;
            });

            return response()->json([
                'message' => 'Quiz généré avec succès. Révisez les questions avant de publier.',
                'quiz'    => $quiz->load('questions.choix'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Quiz generation failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/quiz/import-json
     * Upload an existing QCM JSON file, decode it and create the quiz.
     */
    public function importJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fichier'       => 'required|file|mimetypes:application/json,text/plain|max:5120',
            'titre'         => 'required|string|max:255',
            'temps_limite'  => 'nullable|integer|min:5|max:180',
            'score_passage' => 'integer|min:0|max:100',
            'ressource_id'  => 'nullable|exists:resources,id',
        ]);

        try {
            $file = $request->file('fichier');
            $content = file_get_contents($file->getRealPath());
            $questionsData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['message' => 'Le fichier fourni n\'est pas un JSON valide.'], 422);
            }

            if (!is_array($questionsData) || empty($questionsData)) {
                return response()->json(['message' => 'Le JSON ne contient aucune question ou n\'a pas la bonne structure en tableau.'], 422);
            }

            // Optional: check structural integrity briefly before DB transaction
            foreach ($questionsData as $qData) {
                if (!isset($qData['enonce']) || !isset($qData['choix']) || !is_array($qData['choix'])) {
                    return response()->json(['message' => 'La structure du JSON (enonce, choix) n\'est pas respectée.'], 422);
                }
            }

            // Sauvegarder en BDD
            $quiz = DB::transaction(function () use ($validated, $questionsData, $request) {
                $quiz = Quiz::create([
                    'enseignant_id'     => $request->user()->id,
                    'ressource_id'      => $validated['ressource_id'] ?? null,
                    'titre'             => $validated['titre'],
                    'slug'              => Str::slug($validated['titre']) . '-' . uniqid(),
                    'temps_limite'      => $validated['temps_limite'] ?? null,
                    'score_passage'     => $validated['score_passage'] ?? 50,
                    'melange_questions' => true,
                    'melange_reponses'  => true,
                    'status'            => 'brouillon',
                ]);

                foreach ($questionsData as $ordre => $qData) {
                    $question = $quiz->questions()->create([
                        'enonce'      => $qData['enonce'],
                        'difficulte'  => $qData['difficulte'] ?? 'moyen',
                        'points'      => $qData['points'] ?? 1,
                        'explication' => $qData['explication'] ?? null,
                        'ordre'       => $ordre,
                    ]);

                    if (isset($qData['choix']) && is_array($qData['choix'])) {
                        foreach ($qData['choix'] as $cOrdre => $choix) {
                            $question->choix()->create([
                                'texte'       => $choix['texte'] ?? 'Option vide',
                                'est_correct' => isset($choix['est_correct']) ? (bool) $choix['est_correct'] : false,
                                'ordre'       => $cOrdre,
                            ]);
                        }
                    }
                }

                return $quiz;
            });

            return response()->json([
                'message' => 'Quiz importé avec succès. Révisez les questions avant de publier.',
                'quiz'    => $quiz->load('questions.choix'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Quiz JSON import failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de l\'importation : ' . $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Enseignant : CRUD Quiz
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/quiz
     * Liste tous les quiz de l'enseignant connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $quizzes = Quiz::where('enseignant_id', $request->user()->id)
            ->withCount('questions')
            ->withCount('tentatives')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($quizzes);
    }

    /**
     * GET /api/quiz/publies
     * Liste tous les quiz publiés (accessible à tous les utilisateurs authentifiés).
     */
    public function listerPublies(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $quizzes = Quiz::where('status', 'publie')
            ->withCount('questions')
            ->orderByDesc('publie_le')
            ->get()
            ->map(function ($quiz) use ($userId) {
                // Toutes les tentatives de cet apprenant pour ce quiz
                $tentatives = QuizTentative::where('quiz_id', $quiz->id)
                    ->where('apprenant_id', $userId)
                    ->orderByDesc('pourcentage')
                    ->get();

                $nbTentatives = $tentatives->count();

                // Meilleure tentative (la plus haute note)
                $meilleure = $tentatives->first();

                // Peut-il encore tenter ?
                $peutTenter = $quiz->nb_tentatives_max === 0 || $nbTentatives < $quiz->nb_tentatives_max;

                $quiz->ma_tentative = $meilleure ? [
                    'score'       => $meilleure->score,
                    'score_total' => $meilleure->score_total,
                    'pourcentage' => $meilleure->pourcentage,
                    'est_reussi'  => $meilleure->est_reussi,
                    'completee_le'=> $meilleure->completee_le,
                ] : null;

                $quiz->nb_mes_tentatives = $nbTentatives;
                $quiz->peut_tenter       = $peutTenter;

                return $quiz;
            });

        return response()->json($quizzes);
    }

    /**
     * GET /api/quiz/{id}
     * Détail complet d'un quiz (questions + choix).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)
            ->with('questions.choix')
            ->findOrFail($id);

        return response()->json($quiz);
    }

    /**
     * PUT /api/quiz/{id}/publier
     * Publie un quiz (brouillon → publié).
     */
    public function publier(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)->findOrFail($id);

        if ($quiz->questions()->count() === 0) {
            return response()->json(['message' => 'Impossible de publier un quiz sans questions.'], 422);
        }

        $updateData = [
            'status'    => 'publie',
            'publie_le' => now(),
        ];

        // Générer un code unique s'il n'existe pas
        if (!$quiz->code) {
            $code = strtoupper(Str::random(6));
            while (Quiz::where('code', $code)->exists()) {
                $code = strtoupper(Str::random(6));
            }
            $updateData['code'] = $code;
        }

        $quiz->update($updateData);

        return response()->json([
            'message' => 'Quiz publié avec succès.',
            'quiz'    => $quiz->fresh(),
        ]);
    }

    /**
     * PUT /api/quiz/{id}/archiver
     * Archive un quiz publié.
     */
    public function archiver(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)->findOrFail($id);
        $quiz->update(['status' => 'archive']);

        return response()->json(['message' => 'Quiz archivé.', 'quiz' => $quiz->fresh()]);
    }

    /**
     * DELETE /api/quiz/{id}
     * Supprime un quiz et toutes ses données associées.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)->findOrFail($id);
        $quiz->delete();

        return response()->json(['message' => 'Quiz supprimé.']);
    }

    /**
     * PUT /api/quiz/{id}
     * Met à jour les métadonnées d'un quiz (titre, temps, score...).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'titre'         => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'temps_limite'  => 'nullable|integer|min:5|max:180',
            'score_passage' => 'sometimes|integer|min:0|max:100',
            'melange_questions' => 'sometimes|boolean',
            'melange_reponses'  => 'sometimes|boolean',
            'afficher_correction' => 'sometimes|boolean',
            'nb_tentatives_max'   => 'sometimes|integer|min:0',
        ]);

        $quiz->update($validated);

        return response()->json([
            'message' => 'Quiz mis à jour.',
            'quiz'    => $quiz->fresh()->load('questions.choix'),
        ]);
    }

    /**
     * PUT /api/quiz/{id}/questions
     * Synchronise toutes les questions + choix d'un quiz.
     * Payload : { questions: [ { id?, enonce, difficulte, points, explication, choix: [{id?, texte, est_correct}] } ] }
     */
    public function syncQuestions(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'questions'                      => 'required|array',
            'questions.*.id'                 => 'nullable|integer',
            'questions.*.enonce'             => 'required|string',
            'questions.*.difficulte'         => 'required|in:facile,moyen,difficile',
            'questions.*.points'             => 'required|integer|min:1',
            'questions.*.explication'        => 'nullable|string',
            'questions.*.choix'              => 'required|array|min:2',
            'questions.*.choix.*.id'         => 'nullable|integer',
            'questions.*.choix.*.texte'      => 'required|string',
            'questions.*.choix.*.est_correct'=> 'required|boolean',
        ]);

        DB::transaction(function () use ($quiz, $validated) {
            $keptQuestionIds = [];

            foreach ($validated['questions'] as $ordre => $qData) {
                // Update or create question
                if (!empty($qData['id'])) {
                    $question = $quiz->questions()->findOrFail($qData['id']);
                    $question->update([
                        'enonce'      => $qData['enonce'],
                        'difficulte'  => $qData['difficulte'],
                        'points'      => $qData['points'],
                        'explication' => $qData['explication'] ?? null,
                        'ordre'       => $ordre,
                    ]);
                } else {
                    $question = $quiz->questions()->create([
                        'enonce'      => $qData['enonce'],
                        'difficulte'  => $qData['difficulte'],
                        'points'      => $qData['points'],
                        'explication' => $qData['explication'] ?? null,
                        'ordre'       => $ordre,
                    ]);
                }

                $keptQuestionIds[] = $question->id;
                $keptChoixIds = [];

                foreach ($qData['choix'] as $cOrdre => $choix) {
                    if (!empty($choix['id'])) {
                        $c = $question->choix()->findOrFail($choix['id']);
                        $c->update([
                            'texte'       => $choix['texte'],
                            'est_correct' => (bool) $choix['est_correct'],
                            'ordre'       => $cOrdre,
                        ]);
                        $keptChoixIds[] = $c->id;
                    } else {
                        $c = $question->choix()->create([
                            'texte'       => $choix['texte'],
                            'est_correct' => (bool) $choix['est_correct'],
                            'ordre'       => $cOrdre,
                        ]);
                        $keptChoixIds[] = $c->id;
                    }
                }

                // Supprimer les choix retirés
                $question->choix()->whereNotIn('id', $keptChoixIds)->delete();
            }

            // Supprimer les questions retirées
            $quiz->questions()->whereNotIn('id', $keptQuestionIds)->delete();
        });

        return response()->json([
            'message' => 'Questions mises à jour.',
            'quiz'    => $quiz->fresh()->load('questions.choix'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Apprenant : Passer un quiz
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/quiz/public/{slug}
     * Récupère un quiz publié pour un apprenant (sans les bonnes réponses).
     */
    public function showPublic(Request $request, string $slug): JsonResponse
    {
        $quiz = Quiz::where('slug', $slug)
            ->where('status', 'publie')
            ->with(['questions' => function ($q) {
                $q->orderBy('ordre')->with(['choix' => function ($c) {
                    $c->orderBy('ordre')->select('id', 'question_id', 'texte', 'ordre');
                    // On n'expose pas est_correct !
                }]);
            }])
            ->firstOrFail();

        // Mélanger si demandé
        if ($quiz->melange_questions) {
            $quiz->setRelation('questions', $quiz->questions->shuffle());
        }

        $userId = $request->user()->id;
        $tentatives = QuizTentative::where('quiz_id', $quiz->id)
            ->where('apprenant_id', $userId)
            ->orderByDesc('pourcentage')
            ->get();

        $nbTentatives = $tentatives->count();
        $meilleure = $tentatives->first();
        $peutTenter = $quiz->nb_tentatives_max === 0 || $nbTentatives < $quiz->nb_tentatives_max;

        $quiz->ma_tentative = $meilleure ? [
            'score'       => $meilleure->score,
            'score_total' => $meilleure->score_total,
            'pourcentage' => $meilleure->pourcentage,
            'est_reussi'  => $meilleure->est_reussi,
            'completee_le'=> $meilleure->completee_le,
        ] : null;

        $quiz->nb_mes_tentatives = $nbTentatives;
        $quiz->peut_tenter       = $peutTenter;

        return response()->json($quiz);
    }

    /**
     * GET /api/quiz/public/code/{code}
     * Récupère un quiz publié pour un apprenant via son code d'accès.
     */
    public function showPublicByCode(Request $request, string $code): JsonResponse
    {
        $quiz = Quiz::where('code', $code)
            ->where('status', 'publie')
            ->first();

        if (!$quiz) {
            return response()->json(['message' => 'Code de quiz invalide ou quiz non publié.'], 404);
        }

        return response()->json([
            'slug' => $quiz->slug,
            'titre' => $quiz->titre
        ]);
    }

    /**
     * POST /api/quiz/public/{slug}/soumettre
     * Soumet les réponses d'un apprenant et calcule le score.
     */
    public function soumettre(Request $request, string $slug): JsonResponse
    {
        $quiz = Quiz::where('slug', $slug)->where('status', 'publie')->firstOrFail();

        $request->validate([
            'reponses'               => 'required|array',
            'reponses.*.question_id' => 'required|integer|exists:quiz_questions,id',
            'reponses.*.choix_ids'   => 'present|array',
            'reponses.*.choix_ids.*' => 'integer|exists:quiz_choix,id',
            'temps_passe'            => 'nullable|integer|min:0',
        ]);

        // Vérifier le nb de tentatives restantes
        if ($quiz->nb_tentatives_max > 0) {
            $nbTentatives = QuizTentative::where('quiz_id', $quiz->id)
                ->where('apprenant_id', $request->user()->id)
                ->count();

            if ($nbTentatives >= $quiz->nb_tentatives_max) {
                return response()->json([
                    'message' => 'Nombre maximum de tentatives atteint.'
                ], 422);
            }
        }

        // Charger les questions avec leurs choix corrects
        $questions = $quiz->questions()->with('choix')->get()->keyBy('id');

        $score      = 0;
        $scoreTotal = 0;
        $detail     = [];

        foreach ($request->reponses as $reponse) {
            $questionId = $reponse['question_id'];
            $choixIds   = $reponse['choix_ids'] ?? [];

            if (!$questions->has($questionId)) continue;

            $question   = $questions[$questionId];
            $scoreTotal += $question->points;

            $correctIds  = $question->choix->where('est_correct', true)->pluck('id')->sort()->values()->toArray();
            $apprenantIds = collect($choixIds)->map(fn($id) => (int)$id)->sort()->values()->toArray();

            $estCorrect = $correctIds === $apprenantIds;
            if ($estCorrect) $score += $question->points;

            // Si correction affichée
            $detailQuestion = ['question_id' => $questionId, 'est_correct' => $estCorrect];
            if ($quiz->afficher_correction) {
                $detailQuestion['bons_choix']   = $correctIds;
                $detailQuestion['explication']  = $question->explication;
            }
            $detail[] = $detailQuestion;
        }

        $pourcentage = $scoreTotal > 0 ? (int) round(($score / $scoreTotal) * 100) : 0;
        $estReussi   = $pourcentage >= $quiz->score_passage;

        $tentative = QuizTentative::create([
            'quiz_id'      => $quiz->id,
            'apprenant_id' => $request->user()->id,
            'score'        => $score,
            'score_total'  => $scoreTotal,
            'pourcentage'  => $pourcentage,
            'est_reussi'   => $estReussi,
            'temps_passe'  => $request->temps_passe,
            'completee_le' => now(),
        ]);

        return response()->json([
            'message'     => $estReussi ? 'Félicitations ! Quiz réussi 🎉' : 'Quiz terminé. Continuez à vous améliorer !',
            'score'       => $score,
            'score_total' => $scoreTotal,
            'pourcentage' => $pourcentage,
            'est_reussi'  => $estReussi,
            'tentative_id'=> $tentative->id,
            'detail'      => $quiz->afficher_correction ? $detail : [],
        ]);
    }

    /**
     * GET /api/quiz/{id}/statistiques
     * Statistiques d'un quiz pour l'enseignant.
     */
    public function statistiques(Request $request, int $id): JsonResponse
    {
        $quiz = Quiz::where('enseignant_id', $request->user()->id)
            ->withCount('tentatives')
            ->findOrFail($id);

        $tentatives = QuizTentative::where('quiz_id', $id)
            ->with('apprenant:id,nom,prenom,email')
            ->orderByDesc('created_at')
            ->get();

        $stats = [
            'nb_tentatives'    => $tentatives->count(),
            'nb_reussites'     => $tentatives->where('est_reussi', true)->count(),
            'score_moyen'      => $tentatives->avg('pourcentage') ? round($tentatives->avg('pourcentage'), 1) : 0,
            'score_max'        => $tentatives->max('pourcentage') ?? 0,
            'score_min'        => $tentatives->min('pourcentage') ?? 0,
            'taux_reussite'    => $tentatives->count() > 0
                ? round(($tentatives->where('est_reussi', true)->count() / $tentatives->count()) * 100, 1)
                : 0,
            'temps_moyen_sec'  => $tentatives->whereNotNull('temps_passe')->avg('temps_passe')
                ? round($tentatives->whereNotNull('temps_passe')->avg('temps_passe'))
                : null,
        ];

        return response()->json([
            'quiz'       => $quiz,
            'stats'      => $stats,
            'tentatives' => $tentatives,
        ]);
    }
}