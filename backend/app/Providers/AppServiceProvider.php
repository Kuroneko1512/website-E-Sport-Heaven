<?php

namespace App\Providers;


use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Laravel\Passport\Passport;
use App\Services\Order\OrderService;
use Illuminate\Support\ServiceProvider;
use App\Services\Product\ProductService;
use App\Services\Category\CategoryService;
use App\Services\Attribute\AttributeService;
use App\Services\Product\ProductVariantService;
use App\Services\Attribute\AttributeValueService;

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
        $this->app->singleton(OrderService::class, function ($app) {
            return new OrderService($app->make(Order::class));
        });
        $this->app->singleton(CategoryService::class, function ($app) {
            return new CategoryService($app->make(Category::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Passport::enablePasswordGrant();
      
    }
}
