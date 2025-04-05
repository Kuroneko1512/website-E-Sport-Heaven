<?php

namespace App\Services\Coupon;

use App\Models\Coupon;

class CouponServices
{
    public function getCouponAll()
    {
        return Coupon::all();
    }

    public function getCouponById($id)
    {
        return Coupon::find($id);
    }

    public function createCoupon($data)
    {
        return Coupon::create($data);
    }
    
    public function updateCoupon($id, $data)
    {
        return Coupon::find($id)->update($data);
    }

    public function deleteCoupon($id)
    {
        return Coupon::find($id)->delete();
    }
}
