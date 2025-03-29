<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\v1\AdminAuthController;

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
        });
    });
});
