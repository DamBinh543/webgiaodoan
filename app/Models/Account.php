<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens; // Thêm để hỗ trợ API Token

class Account extends Model
{
    use HasFactory, HasApiTokens; // Thêm HasApiTokens để sử dụng API Token với Sanctum

    protected $primaryKey = 'account_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'account_id',
        'username',
        'password',
        'phone',
        'address',
        'userType',
        'join',
    ];

    // Các trường không nên hiển thị trong kết quả JSON (chẳng hạn như mật khẩu)
    protected $hidden = [
        'password',
    ];

    // Nếu có các trường ngày tháng, bạn có thể định nghĩa chúng như sau:
    protected $dates = [
        'join',
    ];

    // Nếu bạn sử dụng API Token, bạn có thể thêm một thuộc tính 'api_token' nếu cần
    protected $casts = [
        'api_token' => 'string',
    ];
}
