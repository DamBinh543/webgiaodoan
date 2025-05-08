<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->string('item_id')->primary();
            $table->integer('product_id');
            $table->string('cart_id');
            $table->integer('quantity');
            $table->text('note'); 
            $table->timestamps();
        
            $table->foreign('product_id')->references('product_id')->on('products');
            $table->foreign('cart_id')->references('cart_id')->on('carts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
