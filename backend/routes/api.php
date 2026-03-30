<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TypeRessourceController;
use App\Http\Controllers\DisciplineController;
use App\Http\Controllers\NiveauController;
use App\Http\Controllers\Api\QuizIaController;
use App\Http\Controllers\Api\QcmBibliothequeController;

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
    });

    // ── Quiz ─────────────────────────────────────────────────────────────
    Route::prefix('quiz')->group(function () {
        // Routes fixes (avant les routes paramétrées pour éviter les conflits)
        Route::post('/generer',              [QuizIaController::class, 'generer']);
        Route::post('/import-json',          [QuizIaController::class, 'importJson']);
        Route::get('/',                      [QuizIaController::class, 'index']);
        Route::get('/publies',               [QuizIaController::class, 'listerPublies']);
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
});
