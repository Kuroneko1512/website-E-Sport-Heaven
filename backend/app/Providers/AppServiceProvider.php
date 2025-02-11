<?php

namespace App\Providers;

use App\Models\AttributeValue;
use App\Models\Attribute;
use App\Services\Attribute\AttributeService;
use App\Services\Attribute\AttributeValueService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AttributeService::class, function ($app) {
            return new AttributeService($app->make(Attribute::class));
        });
        $this->app->singleton(AttributeValueService::class, function ($app) {
            return new AttributeValueService($app->make(AttributeValue::class));
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
