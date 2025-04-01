<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\v1\CustomerAuthController;
use App\Http\Controllers\Api\Profile\V1\CustomerProfileController;
use App\Http\Controllers\Api\Profile\V1\ShippingAddressController;


Route::prefix('v1')->group(function () {
    Route::group(['prefix' => 'customer', 'as' => 'customer.'], function () {
        Route::get('/', function () {
            return 'Customer API';
        });

        Route::post('/register', [CustomerAuthController::class, 'register'])->name('register');

        Route::post('/login', [CustomerAuthController::class, 'login'])->name('login');
        Route::post('refresh', [CustomerAuthController::class, 'refresh'])->name('refresh');

        // Protected routes - yêu cầu đăng nhập
        Route::middleware('auth:customer')->group(function () {
            Route::post('/logout', [CustomerAuthController::class, 'logout'])->name('logout');
            Route::post('/update-info', [CustomerAuthController::class, 'updateAccount'])->name('update-info');

            Route::get('/profile', [CustomerProfileController::class, 'getProfile'])->name('profile');
            Route::post('/update-profile', [CustomerProfileController::class, 'updateProfile'])->name('update-profile');

            // Sử dụng API Resource cho địa chỉ giao hàng
            Route::apiResource('shipping-address', ShippingAddressController::class, [
                'parameters' => ['shipping-address' => 'id']
            ]);

            // Thêm route riêng cho setDefault
            Route::post('shipping-address/{shipping_address}/set-default', [ShippingAddressController::class, 'setDefault'])
                ->name('shipping-address.set-default');
        });
    });
});
