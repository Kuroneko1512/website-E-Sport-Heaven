<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeValueController;
use App\Http\Controllers\Api\BlogCategoryController;
use App\Http\Controllers\Api\BlogController;
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
Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
Route::resource('/attributeValue',AttributeValueController::class)->except(['index']);

// Lấy danh sách tất cả danh mục blog
Route::get('/blog-categories', [BlogCategoryController::class, 'index']);
// Lấy thông tin chi tiết danh mục blog
Route::get('/blog-categories/{id}', [BlogCategoryController::class, 'show']);
// Tạo mới danh mục blog
Route::post('/blog-categories', [BlogCategoryController::class, 'store']);
// Cập nhật danh mục blog
Route::put('/blog-categories/{id}', [BlogCategoryController::class, 'update']);
// Xóa danh mục blog
Route::delete('/blog-categories/{id}', [BlogCategoryController::class, 'destroy']);

// Lấy danh sách tất cả bài viết blog
Route::get('/blogs', [BlogController::class, 'index']);
// Lấy thông tin chi tiết bài viết blog
Route::get('/blogs/{id}', [BlogController::class, 'show']);
// Tạo mới bài viết blog
Route::post('/blogs', [BlogController::class, 'store']);
// Cập nhật bài viết blog
Route::put('/blogs/{id}', [BlogController::class, 'update']);
// Xóa bài viết blog
Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
