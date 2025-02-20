<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeValueController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::resource('/attribute',AttributeController::class);
Route::prefix('attribute')->group(function () {
    Route::get('/trashed', [AttributeController::class, 'trashed']);
    Route::post('/{id}/restore', [AttributeController::class, 'restore']);
    Route::delete('/{id}/force', [AttributeController::class, 'forceDelete']);
});

Route::resource('/product',ProductController::class);
Route::prefix('product')->group(function () {
    Route::get('/trashed', [ProductController::class, 'trashed']);
    Route::post('/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('/{id}/force', [ProductController::class, 'forceDelete']);
});

Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
Route::get('/attributeValue/trashed/{attribute_id?}', [AttributeValueController::class, 'trashed']);
Route::post('/attributeValue/{id}/restore', [AttributeValueController::class, 'restore']);
Route::delete('/attributeValue/{id}/force', [AttributeValueController::class, 'forceDelete']);
Route::resource('/attributeValue',AttributeValueController::class)->except(['index']);