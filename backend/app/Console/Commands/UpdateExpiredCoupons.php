<?php

namespace App\Console\Commands;

use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateExpiredCoupons extends Command
{
    protected $signature = 'coupons:update-expired';
    protected $description = 'Cập nhật trạng thái của các mã giảm giá đã hết hạn';

    public function handle()
    {
        $expiredCoupons = Coupon::where('end_date', '<', Carbon::now())
            ->where('is_active', 0)
            ->get();

        foreach ($expiredCoupons as $coupon) {
            $coupon->is_active = 1;
            $coupon->save();
        }

        $this->info('Đã cập nhật ' . $expiredCoupons->count() . ' mã giảm giá hết hạn.');
    }
}