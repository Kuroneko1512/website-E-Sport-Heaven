<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_discount_amount',
        'max_uses',
        'is_active',
        'start_date',
        'end_date',
    ];
    
    use HasFactory;
    public function usages()
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id', 'id');
    }
}
