<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF token endpoint for frontend
Route::get('/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
})->middleware('web');

// Sanctum CSRF cookie endpoint (already handled by Sanctum)
// This is automatically available at /sanctum/csrf-cookie

