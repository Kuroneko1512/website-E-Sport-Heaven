<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'customer_id', 'customer_name', 'customer_email', 
        'customer_phone', 'shipping_address', 'total_amount', 'status','order_code'
    ];

    /**
     * Quan hệ với bảng order_items (Một đơn hàng có nhiều sản phẩm)
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Quan hệ với bảng customer_profiles (Một đơn hàng có thể thuộc về một khách hàng)
     */
    public function customer()
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id');
    }
}
