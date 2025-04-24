<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        return Cart::all();
    }

    public function show($id)
    {
        return Cart::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cart_id' => 'required|string|unique:carts,cart_id',
            'account_id' => 'required|string',
            'status' => 'required|integer',
        ]);

        return Cart::create($data);
    }

    public function update(Request $request, $id)
    {
        $cart = Cart::findOrFail($id);
        $cart->update($request->all());

        return $cart;
    }

    public function destroy($id)
    {
        Cart::destroy($id);
        return response()->json(['message' => 'Giỏ hàng đã xóa']);
    }
}
