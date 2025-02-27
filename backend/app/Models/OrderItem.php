<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;
    protected $fillable = ['order_id', 'product_id', 'product_variant_id', 'quantity', 'price', 'subtotal'];

    /**
     * Quan hệ với bảng orders (Một order_item thuộc về một đơn hàng)
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Quan hệ với bảng products (Một order_item thuộc về một sản phẩm)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Quan hệ với bảng product_variants (Một order_item có thể có một biến thể sản phẩm)
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
