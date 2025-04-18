<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\v1\AdminAuthController;
use App\Http\Controllers\Api\Location\LocationImportController;
use App\Http\Controllers\Api\Profile\V1\AdminProfileController;

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

            //Attributes routes

            //Category routes

            //Order routes

            //Customer routes

            //User routes ( Staff)

            //Role and Permission routes

            
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
