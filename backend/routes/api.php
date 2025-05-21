<?php

use App\Helpers\UrlHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Helpers\UrlHelper;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\Payment\PaymentController;
use App\Events\TestEvent;

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

require __DIR__ . '/api_v1.php';


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/vnpay-payment', [PaymentController::class, 'createPayment']);
Route::get('/vnpay-return', [PaymentController::class, 'vnpayReturn']);

Route::get('/check-env', function () {
    return env('PASSPORT_CLIENT_ID'); // Hoặc: return config('services.passport.client_id');
});

Route::get('/test-url-helper', function () {
    dd( UrlHelpers::clientUrl('test'));
});

Route::get('/test-event', function () {
    broadcast(new TestEvent("Hi client!"));
    return "Event broadcasted";
});