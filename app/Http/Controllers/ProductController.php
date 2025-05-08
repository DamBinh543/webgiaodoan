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
            'title'    => 'required|string',
            'status'   => 'required|integer',
            'price'    => 'required|numeric',
            'img'      => 'required|string',
            'category' => 'required|string',
            'desc'     => 'required|string',
        ]);
    
        $maxId = Product::max('product_id');
        $data['product_id'] = $maxId ? $maxId + 1 : 1;
    
        $product = Product::create($data);
        return response()->json($product, 201);
    }


public function update(Request $request, $id)
{
    $product = Product::where('product_id', $id)->firstOrFail();

    $data = $request->validate([
        'title' => 'required|string',
        'status' => 'required|integer',
        'price' => 'required|numeric',
        'img' => 'required|string',
        'category' => 'required|string',
        'desc' => 'required|string',
    ]);

    $product->update($data);
    return response()->json($product);
}

    public function destroy($id)
    {
        $product = Product::where('product_id', $id)->firstOrFail();
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
