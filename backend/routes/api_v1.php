<?php

use App\Http\Controllers\Api\Attribute\V1\AttributeController;
use App\Http\Controllers\Api\Attribute\V1\AttributeValueController;
use App\Http\Controllers\Api\Blog\V1\BlogCategoryController;
use App\Http\Controllers\Api\Blog\V1\BlogController;
use App\Http\Controllers\Api\Order\V1\OrderController;
use App\Http\Controllers\Api\Product\V1\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Category\V1\CategoryController;
use App\Http\Controllers\Api\location\V1\ImportController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(callback: function () {
    Route::apiResource('/attribute', AttributeController::class);
    Route::get('/category/indexNoPagination', [CategoryController::class, 'indexNoPagination']);
    Route::apiResource('/category', CategoryController::class);
    Route::get('/product/search', [ProductController::class, 'searchProducts']);
    Route::get('/product/fillter', [ProductController::class, 'getProductFillterAll']);
    Route::apiResource('/product', ProductController::class);
    Route::get('/product/{id}/Detail', [ProductController::class, 'showForDetails']);
    Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
    Route::post('/attribute/filter', [AttributeController::class, 'getAttributeForIds']);
    Route::apiResource('/attributeValue', AttributeValueController::class)->except(['index']);
    Route::apiResource('/order', OrderController::class);
    Route::get('/order/showByCode/{order_code}', [OrderController::class, 'showOrderByCode']);
    Route::put('/order/{id}/status', [OrderController::class, 'updateStatus']);
    Route::apiResource('/review', ReviewController::class);
    Route::apiResource('/blog-categories', BlogCategoryController::class);
    Route::apiResource('/blogs', BlogController::class);
    Route::post('/import', [ImportController::class, 'import']);
    Route::get('/import-progress', [ImportController::class, 'importProgress']);
});
