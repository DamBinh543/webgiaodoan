<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        return Item::all();
    }

    public function show($id)
    {
        return Item::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id'    => 'required|string|unique:items,item_id',
            'cart_id'    => 'required|string',
            'product_id' => 'required|integer',
            'quantity'   => 'required|integer',
            'note'       => 'nullable|string',
        ]);
    
        $data['note'] = $data['note'] ?? '';
        $item = Item::create($data);
    
        return response()->json($item, 201);
    }
    

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $data = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'note' => 'nullable|string'
        ]);
        $item->update($data);
        return response()->json(['message' => 'Cập nhật thành công', 'item' => $item]);
    }

    public function destroy($id)
    {
        Item::destroy($id);
        return response()->json(['message' => 'Item đã xóa']);
    }
}
