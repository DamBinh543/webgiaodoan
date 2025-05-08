<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;

Route::post('/accounts/login', [AccountController::class, 'login']);
Route::apiResource('products', ProductController::class);
Route::apiResource('accounts', AccountController::class);
Route::apiResource('carts', CartController::class);
Route::apiResource('comments', CommentController::class);
Route::apiResource('items', ItemController::class);
Route::apiResource('orders', OrderController::class);
Route::get('orders/account/{account_id}', [OrderController::class, 'getByAccount']);
