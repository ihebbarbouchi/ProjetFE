<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TypeRessourceController;
use App\Http\Controllers\DisciplineController;
use App\Http\Controllers\NiveauController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\Api\QuizIaController;
use App\Http\Controllers\Api\QcmBibliothequeController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ── Routes publiques (sans authentification) ──────────────────────────────
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/resources/category/{cat_id}', 'App\Http\Controllers\ResourceController@indexByCategory');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/complete-profile', [AuthController::class, 'completeProfile']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/pending-teachers', [AdminController::class, 'pendingTeachers']);

        // Routes génériques (enseignants + apprenants)
        Route::post('/approve-user/{id}', [AdminController::class, 'approveUser']);
        Route::post('/reject-user/{id}', [AdminController::class, 'rejectUser']);
        Route::post('/reset-user/{id}', [AdminController::class, 'resetUser']);

        // Routes legacy compatibilité (conservées)
        Route::post('/approve-teacher/{id}', [AdminController::class, 'approveTeacher']);
        Route::post('/reject-teacher/{id}', [AdminController::class, 'rejectTeacher']);
        Route::post('/reset-teacher/{id}', [AdminController::class, 'resetTeacher']);
        
        Route::post('/create-user', [AdminController::class, 'createUser']);
        Route::post('/update-user/{id}', [AdminController::class, 'updateUser']);
        
        // Resource Types
        Route::apiResource('types-ressources', TypeRessourceController::class);
        
        // Disciplines
        Route::apiResource('disciplines', DisciplineController::class);
        
        // Niveaux
        Route::apiResource('niveaux', NiveauController::class);

        // Catégories (admin)
        Route::post('/categories',            [CategoryController::class, 'store']);
        Route::post('/approve-category/{id}', [CategoryController::class, 'approve']);
        Route::post('/reject-category/{id}',  [CategoryController::class, 'reject']);
        Route::delete('/categories/{id}',     [CategoryController::class, 'destroy']);

        // Suggestions (admin)
        Route::get('/suggestions',            [SuggestionController::class, 'index']);
        Route::post('/suggestions/{id}/accept', [SuggestionController::class, 'accept']);
        Route::post('/suggestions/{id}/refuse', [SuggestionController::class, 'refuse']);
        Route::patch('/suggestions/{id}',     [SuggestionController::class, 'update']);
    });

    // ── Catégories ────────────────────────────────────────────────────────
    Route::get('/list-categories', [CategoryController::class, 'index']);
    Route::post('/suggest-category', [CategoryController::class, 'store']);
    Route::post('/suggestions', [SuggestionController::class, 'store']);

    // ── Quiz ─────────────────────────────────────────────────────────────
    Route::prefix('quiz')->group(function () {
        // Routes fixes (avant les routes paramétrées pour éviter les conflits)
        Route::post('/generer',              [QuizIaController::class, 'generer']);
        Route::post('/import-json',          [QuizIaController::class, 'importJson']);
        Route::get('/',                      [QuizIaController::class, 'index']);
        Route::get('/publies',               [QuizIaController::class, 'listerPublies']);
        Route::get('/public/code/{code}',    [QuizIaController::class, 'showPublicByCode']);
        Route::get('/public/{slug}',         [QuizIaController::class, 'showPublic']);
        Route::post('/public/{slug}/soumettre', [QuizIaController::class, 'soumettre']);

        // Routes paramétrées par ID en dernier
        Route::get('/{id}',                  [QuizIaController::class, 'show']);
        Route::put('/{id}',                  [QuizIaController::class, 'update']);
        Route::put('/{id}/questions',        [QuizIaController::class, 'syncQuestions']);
        Route::put('/{id}/publier',          [QuizIaController::class, 'publier']);
        Route::put('/{id}/archiver',         [QuizIaController::class, 'archiver']);
        Route::delete('/{id}',               [QuizIaController::class, 'destroy']);
        Route::get('/{id}/statistiques',     [QuizIaController::class, 'statistiques']);
    });

    // ── QCM Bibliothèque ─────────────────────────────────────────────────
    Route::prefix('qcm-bibliotheque')->group(function () {
        Route::get('/meta',           [QcmBibliothequeController::class, 'meta']);
        Route::get('/',               [QcmBibliothequeController::class, 'index']);
        Route::post('/',              [QcmBibliothequeController::class, 'store']);
        Route::get('/{id}',           [QcmBibliothequeController::class, 'show']);
        Route::delete('/{id}',        [QcmBibliothequeController::class, 'destroy']);
        Route::post('/{id}/importer', [QcmBibliothequeController::class, 'importer']);
    });

    // ── Notifications ─────────────────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
        Route::patch('/read-all',    [NotificationController::class, 'markAllAsRead']);
        Route::get('/',              [NotificationController::class, 'index']);
        Route::patch('/{id}/read',   [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}',       [NotificationController::class, 'destroy']);
    });

    // ── Resources ────────────────────────────────────────────────────────
    Route::get('/my-resources', 'App\Http\Controllers\ResourceController@myResources');
    Route::post('/resources', 'App\Http\Controllers\ResourceController@store');
    Route::delete('/resources/{id}', 'App\Http\Controllers\ResourceController@destroy');
});
