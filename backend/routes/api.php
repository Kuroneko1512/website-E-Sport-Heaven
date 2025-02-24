<?php

use App\Http\Controllers\Api\Attribute\V1\AttributeController as V1AttributeController;
use App\Http\Controllers\Api\Attribute\V1\AttributeValueController as V1AttributeValueController;
use App\Http\Controllers\Api\Product\V1\ProductController as V1ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;

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
require __DIR__.'/api_v1.php';


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::resource('/attribute',AttributeController::class);
Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
Route::resource('/attributeValue',AttributeValueController::class)->except(['index']);
Route::resource('/category', CategoryController::class); //Category

   
