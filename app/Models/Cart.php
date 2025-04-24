<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $primaryKey = 'cart_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'cart_id',
        'account_id',
        'status',
    ];

    // Sử dụng HasFactory để hỗ trợ các factory cho model
    use HasFactory;

    // Nếu có các trường ngày tháng, bạn có thể định nghĩa chúng như sau:
    // protected $dates = [];
}
