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
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id')->primary();
            $table->string('customer');
            $table->string('address');
            $table->char('phone', 10);
            $table->double('total_money');
            $table->string('payment_method');
            $table->boolean('is_payment');
            $table->string('cart_id');
            $table->text('note')->nullable();
            $table->dateTime('delivery_time');
            $table->timestamps();
        
            $table->foreign('cart_id')->references('cart_id')->on('carts');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
