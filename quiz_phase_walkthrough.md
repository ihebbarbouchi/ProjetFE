# 🎯 Phase Quiz — EduShare — Guide Complet

> **Projet :** EduShare  
> **Phase :** Génération et gestion de quiz avec l'IA Gemini  
> **Stack :** Laravel 10 (backend) · Next.js 14 (frontend) · Google Gemini API  
> **Date :** 16 Mars 2026

---

## 📋 Vue d'ensemble

Le système de quiz permet à un **enseignant** d'uploader un document (PDF ou Word), de générer automatiquement un QCM grâce à **Google Gemini AI**, de le réviser, puis de le publier pour que les **apprenants** puissent le passer en ligne et obtenir un score.

---

## 🗂️ Architecture — Fichiers créés

```
backend/
├── app/
│   ├── Services/
│   │   ├── QuizGeneratorService.php       ← Appel API Gemini
│   │   └── DocumentTextExtractor.php     ← Extraction texte PDF/DOCX
│   ├── Models/
│   │   ├── Quiz.php
│   │   ├── QuizQuestion.php
│   │   ├── QuizChoix.php
│   │   └── QuizTentative.php
│   ├── Http/Controllers/Api/
│   │   └── QuizIaController.php           ← Contrôleur complet
│   └── Providers/
│       └── AppServiceProvider.php         ← Enregistrement des services
├── database/migrations/
│   ├── 2026_03_16_100000_create_quizzes_table.php
│   ├── 2026_03_16_100001_create_quiz_questions_table.php
│   ├── 2026_03_16_100002_create_quiz_choix_table.php
│   └── 2026_03_16_100003_create_quiz_tentatives_table.php
├── config/services.php                    ← Clé + modèle Gemini
└── routes/api.php                         ← 10 endpoints quiz

Frontend/app/
├── teacher/quiz/
│   ├── page.tsx                           ← Gestion quiz enseignant
│   └── [id]/statistiques/page.tsx        ← Stats par quiz
├── student/quiz/
│   └── page.tsx                           ← Liste quiz apprenants
├── quiz/[id]/
│   └── page.tsx                           ← Passer un quiz
└── components/
    └── Layout.tsx                         ← Sidebar mise à jour
```

---

## ⚙️ ÉTAPE 1 — Configuration Gemini

### 1.1 Installer Guzzle HTTP
```bash
cd backend
composer require guzzlehttp/guzzle
```

### 1.2 Ajouter la clé dans [.env](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/.env)
```ini
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 1.3 Déclarer dans [config/services.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/config/services.php)
```php
'gemini' => [
    'key'   => env('GEMINI_API_KEY'),
    'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
],
```

> [!TIP]
> Pour obtenir une clé Gemini : [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 🗄️ ÉTAPE 2 — Base de données

### 2.1 Tables créées

| Table | Description |
|---|---|
| `quizzes` | Quiz principal (titre, slug, statut, temps, score passage) |
| `quiz_questions` | Questions QCM (énoncé, difficulté, points, explication) |
| `quiz_choix` | Choix de réponses (texte, est_correct) |
| `quiz_tentatives` | Résultats des apprenants (score, pourcentage, réussite) |

### 2.2 Schéma des relations

```
Utilisateur (enseignant)
    └── Quiz (1→N)
            ├── QuizQuestion (1→N)
            │       └── QuizChoix (1→N)
            └── QuizTentative (1→N) ← liée à un apprenant
```

### 2.3 Lancer les migrations
```bash
php artisan migrate
```

> [!IMPORTANT]
> MySQL doit être démarré avant de lancer les migrations.

---

## 🔧 ÉTAPE 3 — Services Laravel

### 3.1 [QuizGeneratorService](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Services/QuizGeneratorService.php#9-157)

Responsabilités :
- Construire le **prompt pédagogique** pour Gemini
- Appeler l'API REST de Gemini (`generateContent`)
- Parser la réponse JSON (nettoyer les balises markdown)
- Gérer les erreurs (429 rate limit, réponse malformée)

**Prompt clé :**
- Génère exactement N questions QCM
- Difficulté : `facile` (1pt) / `moyen` (2pts) / `difficile` (3pts)
- 1 ou 2 bonnes réponses par question
- Format JSON strict sans texte autour

### 3.2 [DocumentTextExtractor](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Services/DocumentTextExtractor.php#7-94)

Responsabilités :
- **PDF** → via `pdftotext` (poppler) ou extraction brute en fallback
- **DOCX** → via `ZipArchive` → lecture du `word/document.xml`

> [!NOTE]
> Sur Windows, `pdftotext` n'est généralement pas disponible.
> Le fallback par lecture brute fonctionne pour les PDF simples.
> Pour une meilleure extraction, installez [poppler-utils](https://poppler.freedesktop.org/).

### 3.3 Enregistrement dans [AppServiceProvider](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Providers/AppServiceProvider.php#9-33)
```php
$this->app->singleton(QuizGeneratorService::class, fn() => new QuizGeneratorService());
$this->app->singleton(DocumentTextExtractor::class, fn() => new DocumentTextExtractor());
```

---

## 🛣️ ÉTAPE 4 — Routes API

### 10 endpoints dans [routes/api.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/routes/api.php)

```
POST   /api/quiz/generer                   ← Upload + génération IA
GET    /api/quiz                           ← Quiz de l'enseignant connecté
GET    /api/quiz/publies                   ← Quiz publiés (tous les users)
GET    /api/quiz/public/{slug}             ← Quiz à passer (sans réponses)
POST   /api/quiz/public/{slug}/soumettre   ← Soumettre ses réponses
GET    /api/quiz/{id}                      ← Détail quiz + questions
PUT    /api/quiz/{id}/publier              ← Brouillon → Publié
PUT    /api/quiz/{id}/archiver             ← Publié → Archivé
DELETE /api/quiz/{id}                      ← Supprimer le quiz
GET    /api/quiz/{id}/statistiques         ← Stats + résultats apprenants
```

> [!IMPORTANT]
> Les routes **fixes** (`/publies`, `/public/{slug}`) doivent être déclarées **avant** les routes paramétrées (`/{id}`) pour éviter les conflits Laravel.

---

## 🎮 ÉTAPE 5 — Contrôleur [QuizIaController](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#16-345)

### Méthodes implémentées

| Méthode | Rôle |
|---|---|
| [generer()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#22-102) | Upload → extraction texte → Gemini → sauvegarde BDD |
| [index()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#107-121) | Liste quiz de l'enseignant (avec comptages) |
| [listerPublies()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#122-135) | Liste tous les quiz publiés |
| [show()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#136-148) | Détail quiz + questions + choix |
| [publier()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#149-171) | Change status : `brouillon` → [publie](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#149-171) |
| [archiver()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#172-183) | Change status : [publie](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#149-171) → [archive](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#172-183) |
| [destroy()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#184-195) | Suppression en cascade |
| [showPublic()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#200-223) | Quiz sans `est_correct` (pour l'apprenant) |
| [soumettre()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#224-308) | Calcul score, enregistre tentative |
| [statistiques()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#309-344) | Stats agrégées + liste tentatives |

### Logique de calcul du score dans [soumettre()](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php#224-308)
```
Pour chaque question :
  → Trier les IDs des choix corrects attendus
  → Trier les IDs des choix soumis par l'apprenant
  → Comparaison exacte des deux tableaux
  → Si égaux : +points de la question

pourcentage = (score / score_total) * 100
est_reussi  = pourcentage >= quiz.score_passage
```

---

## 🖥️ ÉTAPE 6 — Frontend Next.js

### 6.1 Page enseignant `/teacher/quiz`

**Fonctionnalités :**
- ✅ Stats rapides (total, publiés, brouillons)
- ✅ Liste des quiz avec badge de statut
- ✅ Actions au hover : Publier / Stats / Archiver / Supprimer
- ✅ Modal de génération IA avec :
  - Upload drag-and-drop (PDF, DOC, DOCX)
  - Formulaire : titre, nb questions, temps limite, score passage
  - États animés : idle → uploading → generating → done / error

### 6.2 Page statistiques `/teacher/quiz/{id}/statistiques`

**Fonctionnalités :**
- ✅ 4 cartes KPI : tentatives, réussites, taux, score moyen
- ✅ Bande infos : score min/max, temps moyen, seuil
- ✅ Liste des tentatives par apprenant avec badge réussi/échoué

### 6.3 Page apprenant `/student/quiz`

**Fonctionnalités :**
- ✅ Grille de quiz publiés
- ✅ Barre de recherche
- ✅ Cartes avec infos (questions, temps, score requis)
- ✅ Bouton "Commencer le quiz"

### 6.4 Page quiz `/quiz/{slug}`

**3 états principaux :**

#### État `intro`
- Informations du quiz (nb questions, temps, score requis)
- Bouton "Commencer"

#### État [quiz](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Models/QuizTentative.php#30-34) (en cours)
- Barre de progression + numérotation
- ⏱️ Timer countdown avec alerte rouge < 60 sec
- Questions avec cases à cocher (multi-select)
- Indicateurs de navigation (points colorés)
- Navigation Précédent / Suivant / Soumettre

#### État `result`
- Score en grand avec couleur (vert=réussi, rouge=échoué)
- Badge Réussi/Échoué avec seuil affiché
- Correction détaillée question par question (si activée)
- Explication pédagogique pour chaque question

### 6.5 Navigation — [Layout.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/components/Layout.tsx) mise à jour

```
Enseignant sidebar :
  Home > Mes ressources > Ajouter ressource > 📊 Mes Quiz (NEW) > Catégories > Apprenants

Apprenant sidebar :
  Home > Catégories > Ressources > ❓ Quiz disponibles (NEW)
```

---

## 🔄 ÉTAPE 7 — Flux complet

```
┌─────────────────────────────────────────────────────────────────┐
│  ENSEIGNANT                                                       │
│                                                                   │
│  1. /teacher/quiz → Clic "Générer un quiz IA"                    │
│  2. Upload PDF/Word → Saisit titre + paramètres                  │
│  3. Backend extrait le texte du document                         │
│  4. Gemini génère N questions QCM en JSON                        │
│  5. Quiz sauvegardé en BDD (status: brouillon)                   │
│  6. Enseignant révise dans la liste                              │
│  7. Clic "Publier" → status: publie                              │
│  8. Partage le lien /quiz/{slug} aux apprenants                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  APPRENANT                                                        │
│                                                                   │
│  1. /student/quiz → Voit les quiz publiés                        │
│  2. Clic "Commencer" → /quiz/{slug}                              │
│  3. Page intro : hésite les infos, démarre                       │
│  4. Répond aux questions (timer actif si limite définie)         │
│  5. Clique "Soumettre"                                           │
│  6. Backend calcule le score, enregistre la tentative            │
│  7. Voit son score + correction détaillée                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ENSEIGNANT (suivi)                                               │
│                                                                   │
│  /teacher/quiz/{id}/statistiques                                  │
│  → Voit taux de réussite, score moyen, temps moyen               │
│  → Voit qui a réussi / échoué avec les scores individuels        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 ÉTAPE 8 — Test du système

### 8.1 Tester la génération (enseignant)
1. Connectez-vous en tant qu'enseignant
2. Allez sur `/teacher/quiz`
3. Cliquez **"Générer un quiz IA"**
4. Uploadez un fichier PDF (ex: cours de 2-3 pages)
5. Mettez un titre, 5 questions, 30 min, 50%
6. Cliquez **"Générer"** → attendez 10-20 secondes
7. Le quiz apparaît en brouillon → cliquez **Publier**

### 8.2 Tester le passage du quiz (apprenant)
1. Connectez-vous en tant qu'apprenant
2. Allez sur `/student/quiz`
3. Cliquez sur un quiz publié
4. Répondez aux questions et soumettez
5. Vérifiez le score et la correction

### 8.3 Vérifier les stats (enseignant)
1. Retournez sur `/teacher/quiz`
2. Cliquez **Stats** sur un quiz publié
3. Vérifiez les tentatives et scores

---

## ⚠️ Points d'attention

> [!WARNING]
> **Quota API Gemini** : Le plan gratuit est limité à 15 requêtes/minute.
> En cas d'erreur 429, attendez 1 minute et réessayez.

> [!CAUTION]
> **Extraction PDF sur Windows** : `pdftotext` (poppler) n'est pas installé par défaut.
> Le fallback par regex fonctionne pour les PDF simples, mais peut échouer sur les PDF scannés ou protégés.
> Solution : Installer [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases).

> [!NOTE]
> **Modèle Gemini** : `gemini-1.5-flash` est recommandé (rapide, bon quota gratuit).
> `gemini-2.5-flash` est plus puissant mais peut avoir des délais plus longs.

> [!TIP]
> **Qualité des questions** : Plus le document source est riche (3+ pages, bien structuré), meilleures seront les questions générées. Les documents d'une seule page donnent des résultats moins variés.

---

## 🚀 Commandes de démarrage

```bash
# Backend Laravel
cd backend
php artisan serve
# Écoute sur http://localhost:8000

# Frontend Next.js
cd Frontend
npm run dev
# Écoute sur http://localhost:3000
```

---

## 📁 Résumé des fichiers modifiés

| Fichier | Type | Action |
|---|---|---|
| [backend/.env](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/.env) | Config | Ajout `GEMINI_API_KEY`, `GEMINI_MODEL` |
| [backend/config/services.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/config/services.php) | Config | Bloc `gemini` ajouté |
| [backend/app/Providers/AppServiceProvider.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Providers/AppServiceProvider.php) | Backend | Singleton des 2 services |
| [backend/routes/api.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/routes/api.php) | Routes | 10 endpoints quiz |
| [backend/app/Services/QuizGeneratorService.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Services/QuizGeneratorService.php) | Service | 🆕 Créé |
| [backend/app/Services/DocumentTextExtractor.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Services/DocumentTextExtractor.php) | Service | 🆕 Créé |
| [backend/app/Http/Controllers/Api/QuizIaController.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Http/Controllers/Api/QuizIaController.php) | Controller | 🆕 Créé |
| [backend/app/Models/Quiz.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Models/Quiz.php) | Model | 🆕 Créé |
| [backend/app/Models/QuizQuestion.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Models/QuizQuestion.php) | Model | 🆕 Créé |
| [backend/app/Models/QuizChoix.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Models/QuizChoix.php) | Model | 🆕 Créé |
| [backend/app/Models/QuizTentative.php](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/backend/app/Models/QuizTentative.php) | Model | 🆕 Créé |
| `backend/database/migrations/...quizzes.php` | Migration | 🆕 Créé |
| `backend/database/migrations/...questions.php` | Migration | 🆕 Créé |
| `backend/database/migrations/...choix.php` | Migration | 🆕 Créé |
| `backend/database/migrations/...tentatives.php` | Migration | 🆕 Créé |
| [Frontend/app/components/Layout.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/components/Layout.tsx) | Frontend | Quiz ajouté dans sidebar |
| [Frontend/app/teacher/quiz/page.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/teacher/quiz/page.tsx) | Page | 🆕 Créée |
| [Frontend/app/teacher/quiz/[id]/statistiques/page.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/teacher/quiz/%5Bid%5D/statistiques/page.tsx) | Page | 🆕 Créée |
| [Frontend/app/student/quiz/page.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/student/quiz/page.tsx) | Page | 🆕 Créée |
| [Frontend/app/quiz/[id]/page.tsx](file:///c:/Users/extreme/OneDrive/Bureau/ProjetFE/Frontend/app/quiz/%5Bid%5D/page.tsx) | Page | ♻️ Remplacée (refaite) |
