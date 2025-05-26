<?php

namespace App\Http\Controllers;
use App\Models\Cart;
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
        'phone' => 'required|digits:10',
        'total_money' => 'required|numeric',
        'payment_method' => 'required|string',
        'is_payment' => 'required|boolean',
        'cart_id' => 'required|string|exists:carts,cart_id',
        'note' => 'nullable|string',
        'delivery_time' => 'required|date_format:Y-m-d H:i:s', 
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

    public function getByAccount($account_id)
    {
        $cartIds = Cart::where('account_id', $account_id)->pluck('cart_id');
        $orders = Order::with(['cart.items.product'])
                        ->whereIn('cart_id', $cartIds)
                        ->get();
    
        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Không có đơn hàng nào'], 404);
        }
    
        return response()->json($orders);
    }
}
