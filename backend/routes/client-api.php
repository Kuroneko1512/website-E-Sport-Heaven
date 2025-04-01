<?php

use App\Http\Controllers\Api\Auth\v1\CustomerAuthController;
use App\Http\Controllers\Api\Profile\V1\CustomerProfileController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::group(['prefix' => 'customer', 'as' => 'customer.'], function () {
        Route::get('/', function () {
            return 'Customer API';
        });

        Route::post('/register',[CustomerAuthController::class, 'register'])->name('register'); 

        Route::post('/login',[CustomerAuthController::class, 'login'])->name('login');
        Route::post('refresh',[CustomerAuthController::class, 'refresh'])->name('refresh');

        Route::middleware('auth:customer')->group(function () {
            Route::post('/logout',[CustomerAuthController::class, 'logout'])->name('logout');
            Route::post('/update-info',[CustomerAuthController::class, 'updateAccount'])->name('update-info');

            Route::get('/profile',[CustomerProfileController::class, 'getProfile'])->name('profile');
            Route::post('/update-profile',[CustomerProfileController::class, 'updateProfile'])->name('update-profile');
        });
    }); 
});
