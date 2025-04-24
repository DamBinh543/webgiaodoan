<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::all();
    }

    public function show($id)
    {
        return Order::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|string|unique:orders,order_id',
            'customer' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|char:10',
            'total_money' => 'required|numeric',
            'payment_method' => 'required|string',
            'is_payment' => 'required|boolean',
            'cart_id' => 'required|string|exists:carts,cart_id', 
            'note' => 'nullable|string',
        ]);

        return Order::create($data);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->all());

        return $order;
    }

    public function destroy($id)
    {
        Order::destroy($id);
        return response()->json(['message' => 'Đơn hàng đã xóa']);
    }
}
