<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// ── Route de test Mailpit ──
Route::get('/test-mail', function () {
    Mail::raw('Email de test depuis Laravel – EduShare', function ($message) {
        $message->to('test@test.com')
                ->subject('✅ Test Mail – EduShare');
    });

    return "✅ Email envoyé ! Vérifie Mailpit sur http://localhost:8025";
});
