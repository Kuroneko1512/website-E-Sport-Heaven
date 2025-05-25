<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Http\Controllers\Controller;
use App\Services\Coupon\CouponUsageServices;

use App\Http\Requests\Coupon\CouponRequests;
use Illuminate\Http\Request;

class CouponUsageController extends Controller
{
    protected $couponUsage;
    public function __construct(CouponUsageServices $couponUsage)
    {
        $this->couponUsage = $couponUsage;
    }
    public function index()
    {
        $couponUsage = $this->couponUsage->getCouponUsage();
        return response()->json(
            [
                'data' => $couponUsage,
                'message' => 'Lấy dữ liệu thành công',
                
            ],
            200
        );
    }
    public function store(CouponRequests $request)
    {
        $couponUsage = $this->couponUsage->addUsage($request->coupon_id, $request->user_id, $request->amount);
        return response()->json(
            [
                'data' => $couponUsage,
                'message' => 'Thêm dữ liệu thành công',
            ],
            200
        );
    }
    public function destroy($id)
    {
        $couponUsage = $this->couponUsage->deleteUsage($id);
        return response()->json(
            [
                'data' => $couponUsage,
                'message' => 'Xóa dữ liệu thành công',
            ],
            200
        );
    }
    public function updateAmount($id, Request $request)
    {
        $couponUsage = $this->couponUsage->updateCouponUsage($id, $request->amount);


        return response()->json(
            [
                'data' => $couponUsage,
                'message' => 'Cập nhật số lần sử dụng thành công',
            ],
            200
        );
    }
}
