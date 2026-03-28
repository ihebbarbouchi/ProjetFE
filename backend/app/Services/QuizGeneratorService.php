<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class QuizGeneratorService
{
    private Client $http;
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct()
    {
        $this->http = new Client(['timeout' => 120, 'verify' => false]);
        $this->apiKey = config('services.groq.key');
        $this->model = config('services.groq.model', 'llama-3.3-70b-versatile');
    }

    /**
     * Génère un quiz depuis un texte extrait d'un document.
     *
     * @param  string $texte        Contenu brut extrait du PDF/Word
     * @param  int    $nbQuestions  Nombre de questions souhaitées (3–30)
     * @return array  Liste de questions structurées
     * @throws \Exception
     */
    public function genererQuiz(string $texte, int $nbQuestions = 10): array
    {
        // Tronquer si trop long (Groq tolère de longs contextes mais on reste raisonnable)
        $texte = mb_substr($texte, 0, 15000);

        $maxRetries = 5;
        $attempt = 0;

        while ($attempt < $maxRetries) {
            try {
                $response = $this->http->post($this->baseUrl, [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => $this->model,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Tu es un expert pédagogique. Tu dois absolument répondre UNIQUEMENT par du JSON valide. N\'ajoute aucun texte avant ni après.'
                            ],
                            [
                                'role' => 'user',
                                'content' => $this->buildPrompt($texte, $nbQuestions)
                            ]
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 4096,
                    ],
                ]);

                $body = json_decode($response->getBody()->getContents(), true);

                $rawText = $body['choices'][0]['message']['content'] ?? '';

                return $this->parseJsonResponse($rawText);

            } catch (RequestException $e) {
                $status = $e->getResponse()?->getStatusCode();

                if ($status === 429) {
                    $attempt++;
                    if ($attempt >= $maxRetries) {
                        throw new \Exception('Limite de requêtes Groq atteinte. Veuillez réessayer dans quelques minutes.');
                    }
                    // Exponential backoff
                    $waitSeconds = 10 * $attempt;
                    Log::warning("Groq rate limit hit, retrying in {$waitSeconds}s (attempt {$attempt}/{$maxRetries})");
                    sleep($waitSeconds);
                    continue;
                }

                $errorBody = $e->getResponse() ? $e->getResponse()->getBody()->getContents() : '';
                Log::error('Groq API error', ['message' => $e->getMessage(), 'body' => $errorBody]);
                throw new \Exception('Erreur IA: ' . $e->getMessage());
            }
        }

        throw new \Exception('Impossible de générer le quiz, réessayez plus tard.');
    }

    /**
     * Parse la réponse JSON (nettoie les backticks markdown).
     */
    private function parseJsonResponse(string $raw): array
    {
        // Supprimer les blocs ```json ... ``` ou ``` ... ```
        $cleaned = preg_replace('/^```(?:json)?\s*/m', '', $raw);
        $cleaned = preg_replace('/^```\s*$/m', '', $cleaned);
        $cleaned = trim($cleaned);

        $data = json_decode($cleaned, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('JSON parse error', ['raw' => $raw]);
            throw new \Exception('La réponse de l\'IA n\'est pas au format attendu. Réessayez.');
        }

        if (!is_array($data) || empty($data)) {
            throw new \Exception('Aucune question générée. Vérifiez le contenu du document.');
        }

        return $data;
    }

    /**
     * Construit le prompt.
     */
    private function buildPrompt(string $texte, int $nb): string
    {
        return <<<PROMPT
Tu es un expert en pédagogie et en création d'évaluations.

À partir du texte ci-dessous, génère exactement {$nb} questions QCM à choix multiples.

RÈGLES OBLIGATOIRES :
- Chaque question a entre 3 et 5 choix de réponses
- Il peut y avoir 1 ou 2 bonnes réponses par question (jamais toutes correctes, jamais aucune)
- Le champ "difficulte" doit être exactement : "facile", "moyen" ou "difficile"
  * facile    = rappel direct d'une information du texte
  * moyen     = compréhension ou application d'un concept
  * difficile = analyse, synthèse ou mise en relation de plusieurs idées
- Le champ "points" doit correspondre : facile=1, moyen=2, difficile=3
- L'"explication" justifie pourquoi les bonnes réponses sont correctes (1-2 phrases)
- Les questions doivent couvrir différentes parties du texte
- Génère UNIQUEMENT le JSON, sans texte avant ni après, sans balises markdown

FORMAT JSON STRICT (tableau de {$nb} objets) :
[
  {
    "enonce": "Question ici ?",
    "difficulte": "facile",
    "points": 1,
    "explication": "Explication ici.",
    "choix": [
      { "texte": "Choix A", "est_correct": true },
      { "texte": "Choix B", "est_correct": false },
      { "texte": "Choix C", "est_correct": false }
    ]
  }
]

TEXTE SOURCE :
---
{$texte}
---

JSON des {$nb} questions :
PROMPT;
    }
}
