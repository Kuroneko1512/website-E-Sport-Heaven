<?php

namespace App\Providers;

use App\Services\Attribute\AttributeService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AttributeService::class, function ($app) {
            return new AttributeService($app->make(\App\Models\Attribute::class));
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
