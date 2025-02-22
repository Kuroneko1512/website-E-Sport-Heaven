<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\Admin\V1\AuthController;
use App\Http\Controllers\Api\Admin\V1\RoleController;
use App\Http\Controllers\Api\Admin\V1\AdminController;
use App\Http\Controllers\Api\AttributeValueController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::resource('/attribute', AttributeController::class);
Route::resource('/product', ProductController::class);
Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
Route::resource('/attributeValue', AttributeValueController::class)->except(['index']);

Route::prefix('admin/v1')->group(function () {
    // Public routes
    Route::post('login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('profile', [AuthController::class, 'profile']);
    });
});
