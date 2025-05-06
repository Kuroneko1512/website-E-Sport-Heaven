<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Order\V1\OrderController;
use App\Http\Controllers\Api\Auth\v1\SocialAuthController;
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

        // Đăng nhập xã hội - không yêu cầu xác thực
        Route::group(['prefix' => 'auth/social', 'as' => 'auth.social.'], function () {
            // Route để lấy URL chuyển hướng đến nhà cung cấp xã hội
            Route::get('{provider}/redirect', [SocialAuthController::class, 'redirectToProvider'])
                ->where('provider', 'google|facebook|github')
                ->name('redirect');

            // Route để xử lý callback từ nhà cung cấp xã hội
            Route::post('{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])
                ->where('provider', 'google|facebook|github')
                ->name('callback');
        });

        Route::get('/review-by-product/{id}',[ReviewController::class,'getByProduct']);

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

            // Thêm route cho đơn hàng của khách hàng
            Route::prefix('orders')->group(function () {
                Route::get('/', [OrderController::class, 'myOrders'])->name('orders.my');
                Route::get('/{orderCode}', [OrderController::class, 'myOrderDetail'])->name('orders.my.detail');
            });

            Route::apiResource('/review', ReviewController::class);
        });

        //test route
        Route::get('/test-cloudinary', function () {
            try {
                $cloudName = config('cloudinary.cloud_name');
                return response()->json([
                    'success' => true,
                    'message' => 'Cloudinary đã được cấu hình đúng',
                    'cloud_name' => $cloudName
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi cấu hình Cloudinary',
                    'error' => $e->getMessage()
                ]);
            }
        });
        Route::get('/test-cloudinary-config', function () {
            return response()->json([
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key') ? 'Đã cấu hình' : 'Chưa cấu hình',
                'api_secret' => config('cloudinary.api_secret') ? 'Đã cấu hình' : 'Chưa cấu hình',
            ]);
        });
        //        
    });
});
