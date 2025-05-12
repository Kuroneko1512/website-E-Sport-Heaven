<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Blog\V1\BlogController;
use App\Http\Controllers\Api\Order\V1\OrderController;
use App\Http\Controllers\Api\Coupons\CouponsController;
use App\Http\Controllers\Api\Location\AddressController;
use App\Http\Controllers\Api\Shipping\V1\GhtkController;
use App\Http\Controllers\Api\Product\V1\ProductController;
use App\Http\Controllers\Api\Blog\V1\BlogCategoryController;
use App\Http\Controllers\Api\Category\V1\CategoryController;
use App\Http\Controllers\Api\Attribute\V1\AttributeController;
use App\Http\Controllers\Api\Attribute\V1\AttributeValueController;

use App\Http\Controllers\Api\User\UserController;
use App\Http\Controllers\Api\Coupons\CouponsController;
use App\Http\Controllers\Api\Admin\V1\ProductController as ProductControllerAdmin;

Route::prefix('v1')->group(callback: function () {
    // Attribute API Routes
    Route::apiResource('/attribute', AttributeController::class);
    Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
    Route::post('/attribute/filter', [AttributeController::class, 'getAttributeForIds']);
    Route::apiResource('/attributeValue', AttributeValueController::class)->except(['index']);

    // Category API Routes
    Route::get('/category/indexNoPagination', [CategoryController::class, 'indexNoPagination']);
    Route::apiResource('/category', CategoryController::class);
    Route::get('/product/search', [ProductController::class, 'searchProducts']);

    // Product API Routes
    Route::get('/product/fillter', [ProductController::class, 'getProductFillterAll']);
    Route::apiResource('/product', ProductController::class);
    Route::get('/product/{id}/Detail', [ProductController::class, 'showForDetails']);

    Route::get('/product/{id}/edit', [ProductControllerAdmin::class, 'getProductByIdEdit']);
    Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
    Route::post('/attribute/filter', [AttributeController::class, 'getAttributeForIds']);
    Route::apiResource('/attributeValue', AttributeValueController::class)->except(['index']);


    // Order API Routes
    Route::post('/order/orders-user-return', [OrderController::class, 'orderUserReturn']);
    Route::apiResource('/order', OrderController::class)->only(['store']);
    Route::get('/order/showByCode/{order_code}', [OrderController::class, 'showOrderByCode']);
    Route::put('/order/{id}/status', [OrderController::class, 'updateStatus']);

    // Blog API Routes
    Route::apiResource('/blog-categories', BlogCategoryController::class);
    Route::apiResource('/blogs', BlogController::class);
    // User API Routes
    Route::apiResource('/user', UserController::class);
    Route::put('/user/{id}/status', [UserController::class, 'updateStatus']);
    // Address API Routes
    Route::prefix('address')->group(function () {
        Route::get('/provinces', [AddressController::class, 'getProvinces']);
        Route::get('/districts', [AddressController::class, 'getDistricts']);
        Route::get('/communes', [AddressController::class, 'getCommunes']);
    });

    // Shipping API Routes
    Route::get('/shipping/fee', [GhtkController::class, 'getShippingFee']);

    // Coupon API Routes
    Route::apiResource('/coupon', CouponsController::class);
});
