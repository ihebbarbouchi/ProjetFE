<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class DocumentTextExtractor
{
    /**
     * Extrait le texte brut d'un fichier PDF ou Word.
     *
     * @param  string $filePath  Chemin absolu vers le fichier
     * @param  string $mimeType  MIME type du fichier
     * @return string            Texte extrait
     * @throws \Exception
     */
    public function extract(string $filePath, string $mimeType): string
    {
        return match (true) {
            str_contains($mimeType, 'pdf')  => $this->extractPdf($filePath),
            str_contains($mimeType, 'word'),
            str_contains($mimeType, 'officedocument') => $this->extractDocx($filePath),
            default => throw new \Exception('Type de fichier non supporté : ' . $mimeType),
        };
    }

    /**
     * Extrait le texte d'un PDF via pdftotext (poppler-utils) ou lecture brute en fallback.
     */
    private function extractPdf(string $filePath): string
    {
        // Tentative via pdftotext (disponible si poppler installé)
        if ($this->commandExists('pdftotext')) {
            $output = shell_exec('pdftotext ' . escapeshellarg($filePath) . ' - 2>/dev/null');
            if ($output && mb_strlen(trim($output)) > 50) {
                return $output;
            }
        }

        // Fallback : lecture brute du PDF (extraction basique du texte visible)
        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \Exception('Impossible de lire le fichier PDF.');
        }

        // Extraction basique des chaînes de texte d'un PDF
        preg_match_all('/\(([^\)]{5,})\)/', $content, $matches);
        $text = implode(' ', $matches[1] ?? []);

        // Nettoyage des caractères non imprimables
        $text = preg_replace('/[^\x20-\x7E\x{00C0}-\x{017E}]/u', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Extrait le texte d'un fichier .docx (ZIP contenant XML).
     */
    private function extractDocx(string $filePath): string
    {
        if (!class_exists('\ZipArchive')) {
            throw new \Exception('Extension PHP ZipArchive requise pour lire les fichiers Word.');
        }

        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new \Exception('Impossible d\'ouvrir le fichier Word.');
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            throw new \Exception('Fichier Word invalide ou corrompu.');
        }

        // Supprimer les balises XML et extraire le texte brut
        $text = strip_tags(str_replace(['</w:p>', '</w:tr>'], "\n", $xml));
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Vérifie si une commande shell est disponible.
     */
    private function commandExists(string $command): bool
    {
        $result = shell_exec('which ' . escapeshellarg($command) . ' 2>/dev/null');
        return !empty(trim($result ?? ''));
    }
}
