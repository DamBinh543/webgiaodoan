<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{

    public function index()
    {
        return response()->json(Cart::with('items.product')->get());
    }

    // Lấy 1 giỏ hàng theo ID
    public function show($id)
    {
        try {
            $cart = Cart::with('items.product')->where('cart_id', $id)->first();

            if (!$cart) {
                return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
            }

            return response()->json($cart);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy giỏ hàng $id: " . $e->getMessage());
            return response()->json(['message' => 'Lỗi máy chủ nội bộ'], 500);
        }
    }

    // Tạo mới giỏ hàng
    public function store(Request $request)
    {
        $data = $request->validate([
            'cart_id' => 'required|string|unique:carts,cart_id',
            'account_id' => 'required|string',
            'status' => 'required|integer',
        ]);

        try {
            $cart = Cart::create($data);
            return response()->json($cart, 201);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi tạo giỏ hàng: " . $e->getMessage());
            return response()->json(['message' => 'Không thể tạo giỏ hàng'], 500);
        }
    }

    // Cập nhật giỏ hàng
    public function update(Request $request, $id)
    {
        try {
            $cart = Cart::findOrFail($id);
            $cart->update($request->all());

            return response()->json($cart);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi cập nhật giỏ hàng $id: " . $e->getMessage());
            return response()->json(['message' => 'Không thể cập nhật giỏ hàng'], 500);
        }
    }

    // Xóa giỏ hàng
    public function destroy($id)
    {
        try {
            $deleted = Cart::destroy($id);

            if ($deleted) {
                return response()->json(['message' => 'Giỏ hàng đã được xóa']);
            }

            return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi xóa giỏ hàng $id: " . $e->getMessage());
            return response()->json(['message' => 'Không thể xóa giỏ hàng'], 500);
        }
    }
}
