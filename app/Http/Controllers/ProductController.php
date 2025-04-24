<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::all();  
        return response()->json($products);  
    }

    public function show($id)
    {
        return Product::where('product_id', $id)->firstOrFail();
    }


    public function store(Request $request)
    {
        $data = $request->validate([
        'product_id' => 'required|string|unique:products,product_id',
        'title' => 'required|string',
        'status' => 'required|integer',
        'price' => 'required|numeric',
        'img' => 'required|string',
        'category' => 'required|string',
        'desc' => 'required|string',
        'created_at' => 'nullable|date', 
        'updated_at' => 'nullable|date', 
        ]);

        return Product::create($data);
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('product_id', $id)->firstOrFail();
        $product->update($request->all());
        return $product;
    }

    public function destroy($id)
    {
        $product = Product::where('product_id', $id)->firstOrFail();
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
