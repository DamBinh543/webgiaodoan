<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Item;

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'product_id';
    public $incrementing = false;       
    protected $keyType = 'int';       

    protected $fillable = [
        'product_id',
        'title',
        'status',
        'price',
        'img',
        'category',
        'desc',
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'product_id', 'product_id');
    }
}
