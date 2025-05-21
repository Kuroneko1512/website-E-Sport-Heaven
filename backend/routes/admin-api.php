<?php

use App\Http\Controllers\Api\Admin\V1\BlogCategoryController;
use App\Http\Controllers\Api\Admin\V1\BlogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\v1\AdminAuthController;
use App\Http\Controllers\Api\Location\LocationImportController;
use App\Http\Controllers\Api\Profile\V1\AdminProfileController;
use App\Http\Controllers\Api\Admin\V1\AttributeController;
use App\Http\Controllers\Api\Admin\V1\CategoryController;
use App\Http\Controllers\Api\Admin\V1\ProductController;
use App\Http\Controllers\Api\Admin\V1\OrderController;
use App\Http\Controllers\Api\Admin\V1\ReviewController;
use App\Http\Controllers\Api\User\UserController;

Route::prefix('v1')->group(function () {
    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {
        Route::get('/', function () {
            return 'Admin API';
        });

        // Authentication routes
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login');
        Route::post('/refresh', [AdminAuthController::class, 'refreshToken'])->name('refresh');


        // Protected routes - yêu cầu đăng nhập
        Route::middleware('auth:admin')->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::post('/update-info', [AdminAuthController::class, 'updateAccount'])->name('update-info');

            // Profile routes
            Route::get('/profile', [AdminProfileController::class, 'getProfile'])->name('profile');
            Route::post('/update-profile', [AdminProfileController::class, 'updateProfile'])->name('update-profile');

            //Product routes
            Route::apiResource('/product', ProductController::class);

            //Attributes routes
            Route::apiResource('/attribute', AttributeController::class);
            //Category routes
            Route::apiResource('/category', CategoryController::class);
            //Order routes
            Route::get('/order/{id}/order-user-return', [OrderController::class, 'getOrderUserReturn']);
            Route::get('/order/order-return', [OrderController::class, 'getOrdersWithReturnRequests']);

            Route::apiResource('/order', OrderController::class);

            Route::get('/order/showByCode/{order_code}', [OrderController::class, 'showOrderByCode']);
            Route::put('/order/{id}/status', [OrderController::class, 'updateStatus']);

            Route::apiResource('/review', ReviewController::class);
            //Customer routes

            //Role and Permission routes

            // Blog routes
            Route::apiResource('blogs', BlogController::class);
            Route::post('blogs/upload-image', [BlogController::class, 'uploadImage'])->name('blogs.upload-image');

            // Blog Category routes
            Route::apiResource('blog-categories', BlogCategoryController::class);

            // Location Import Routes
            Route::prefix('locations')->group(function () {
                Route::post('/import', [LocationImportController::class, 'import'])
                    ->name('locations.import')
                ;

                Route::get('/import/progress', [LocationImportController::class, 'checkProgress'])
                    ->name('locations.import.progress')
                ;

                Route::post('/import/from-public', [LocationImportController::class, 'importFromPublicFiles'])
                    ->name('locations.import.from-public')
                ;
            });
        });
    });
});
