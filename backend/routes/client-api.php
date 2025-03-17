<?php

use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::group(['prefix' => 'customer', 'as' => 'customer.'], function () {
        Route::get('/', function () {
            return 'Customer API';
        });
    });
});
