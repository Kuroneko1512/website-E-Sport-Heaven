<?php
use App\Http\Controllers\Api\Attribute\V1\AttributeController;
use App\Http\Controllers\Api\Attribute\V1\AttributeValueController ;
use App\Http\Controllers\Api\Order\V1\OrderController;
use App\Http\Controllers\Api\Product\V1\ProductController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function (){
    Route::resource('/attribute',AttributeController::class);
    Route::resource('/product',ProductController::class);
    Route::get('/attributeValue/index/{attribute_id}', [AttributeValueController::class, 'index']);
    Route::resource('/attributeValue',AttributeValueController::class)->except(['index']);
    Route::resource('/order',OrderController::class);
    Route::get('/order/showByCode/{order_code}', [OrderController::class, 'showOrderByCode']);

}); 