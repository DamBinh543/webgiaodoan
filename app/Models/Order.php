<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Cart;
class Order extends Model
{
    protected $primaryKey = 'order_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'order_id',
        'customer',
        'address',
        'phone',
        'total_money',
        'payment_method',
        'is_payment',
        'cart_id',
        'note',
        'delivery_time',
    ];

    use HasFactory;
    public function cart()
{
    return $this->belongsTo(Cart::class, 'cart_id', 'cart_id');
}
}
