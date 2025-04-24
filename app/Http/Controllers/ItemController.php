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
            'item_id' => 'required|string|unique:items,item_id',
            'cart_id' => 'required|string',
            'product_id' => 'required|string',
            'quantity' => 'required|integer',
            'note' => 'nullable|string',
        ]);

        return Item::create($data);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $item->update($request->all());

        return $item;
    }

    public function destroy($id)
    {
        Item::destroy($id);
        return response()->json(['message' => 'Item đã xóa']);
    }
}
