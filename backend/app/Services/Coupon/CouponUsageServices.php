<?php

namespace App\Services\Coupon;

use App\Models\CouponUsage;
use App\Services\BaseService;
use App\Models\Coupon;
class CouponUsageServices extends BaseService
{
    protected $couponUsage;

    public function __construct(CouponUsage $couponUsage)
    {
        $this->couponUsage = $couponUsage;
    }

    public function getCouponUsage()
    {
        return $this->couponUsage->with(['user', 'coupon'])
            ->orderBy('id', 'desc')
            ->paginate(10);
    }
    
    public function createCouponUsage($data)
    {
        return $this->couponUsage->create($data);
    }

    public function getCouponUsageById($id)
    {
        return $this->couponUsage->with(['user', 'coupon'])->findOrFail($id);
    }

    public function addUsage($couponId, $userId, $amount)
    {
        // Lấy thông tin coupon hiện tại
        $coupon = Coupon::findOrFail($couponId);
        
        // Kiểm tra số lượt sử dụng còn lại
        if ($coupon->max_uses < $amount) {
            throw new \Exception('Số lượt sử dụng không đủ');
        }

        // Kiểm tra xem user đã sử dụng coupon này chưa
        $existingUsage = $this->couponUsage
            ->where('coupon_id', $couponId)
            ->where('user_id', $userId)
            ->first();

        if ($existingUsage) {
            // Nếu đã tồn tại thì cập nhật số lượng
            $existingUsage->update([
                'amount' => $existingUsage->amount + $amount
            ]);
            $couponUsage = $existingUsage;
        } else {
            // Nếu chưa tồn tại thì tạo mới
            $couponUsage = $this->couponUsage->create([
                'coupon_id' => $couponId,
                'user_id' => $userId,
                'amount' => $amount
            ]);
        }

        // Cập nhật số lượt sử dụng còn lại của coupon
        $coupon->update([
            'max_uses' => $coupon->max_uses - $amount
        ]);

        return $couponUsage;
    }

    public function deleteUsage($id)
    {
        return $this->couponUsage->findOrFail($id)->delete();
    }

    public function updateCouponUsage($id, $amount)
    {
        $couponUsage = $this->couponUsage->findOrFail($id);
  
        $coupon = Coupon::findOrFail($couponUsage->coupon_id);

        // Kiểm tra nếu số lượng mới vượt quá số lượng còn lại
        if ($amount > $coupon->max_uses) {
            throw new \Exception('Số lần sử dụng không được vượt quá số lượng còn lại');
        }
       
        
        $newMaxUses = $coupon->max_uses - $amount;

        // Kiểm tra nếu số lượt sử dụng mới âm
        if ($newMaxUses < 0) {
            throw new \Exception('Số lượt sử dụng không đủ');
        }

        $coupon->update(['max_uses' => $newMaxUses]);
        $couponUsage->update(['amount' => $amount]);
        
        return $couponUsage;
    }
}


