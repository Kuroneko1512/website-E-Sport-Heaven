<?php

namespace App\Providers;

use App\Models\AttributeValue;
use App\Models\Attribute;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Attribute\AttributeService;
use App\Services\Attribute\AttributeValueService;
use App\Services\Product\ProductService;
use App\Services\Product\ProductVariantService;
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
        $this->app->singleton(ProductService::class, function ($app) {
            return new ProductService($app->make(Product::class));
        });
        $this->app->singleton(ProductVariantService::class, function ($app) {
            return new ProductVariantService($app->make(ProductVariant::class));
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
