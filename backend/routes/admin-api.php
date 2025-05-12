<?php

use App\Http\Controllers\Api\Blog\V1\BlogCategoryController;
use App\Http\Controllers\Api\Blog\V1\BlogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\v1\AdminAuthController;
use App\Http\Controllers\Api\Location\LocationImportController;
use App\Http\Controllers\Api\Profile\V1\AdminProfileController;
use App\Http\Controllers\Api\Admin\V1\AttributeController;
use App\Http\Controllers\Api\Admin\V1\CategoryController;
use App\Http\Controllers\Api\Admin\V1\ProductController;
use App\Http\Controllers\Api\Admin\V1\OrderController;
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


            //Customer routes
      
          

            //Role and Permission routes

            // Blog routes
            Route::prefix('blogs')->group(function () {
                Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
                Route::post('/', [BlogController::class, 'store'])->name('blogs.store');
                Route::get('/{id}', [BlogController::class, 'show'])->name('blogs.show');
                Route::put('/{id}', [BlogController::class, 'update'])->name('blogs.update');
                Route::delete('/{id}', [BlogController::class, 'destroy'])->name('blogs.destroy');
                Route::post('/upload-image', [BlogController::class, 'uploadImage'])->name('blogs.upload-image');
            });

            // Blog Category routes
            Route::prefix('blog-categories')->group(function () {
                Route::get('/', [BlogCategoryController::class, 'index'])->name('blog-categories.index');
                Route::post('/', [BlogCategoryController::class, 'store'])->name('blog-categories.store');
                Route::get('/{id}', [BlogCategoryController::class, 'show'])->name('blog-categories.show');
                Route::put('/{id}', [BlogCategoryController::class, 'update'])->name('blog-categories.update');
                Route::delete('/{id}', [BlogCategoryController::class, 'destroy'])->name('blog-categories.destroy');
            });

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
