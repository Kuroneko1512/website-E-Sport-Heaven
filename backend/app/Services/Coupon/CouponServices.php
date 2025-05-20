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

    public function getCouponsPaginated($perPage = 10, $page = 1, $search = '')
    {
        $query = Coupon::orderBy('id', 'desc');
        
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        return $query->paginate($perPage);
    }
}
