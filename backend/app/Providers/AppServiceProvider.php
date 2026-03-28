<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\QuizGeneratorService;
use App\Services\DocumentTextExtractor;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(QuizGeneratorService::class, function () {
            return new QuizGeneratorService();
        });

        $this->app->singleton(DocumentTextExtractor::class, function () {
            return new DocumentTextExtractor();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
