<?php

namespace App\Http\Controllers\Api\Coupons;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\CouponRequests;
use App\Models\CouponUsage;

use App\Services\Coupon\CouponUsageServices;
class CouponUsageController extends Controller
{
    public $couponUsageServices;
    public function __construct(CouponUsageServices $couponUsageServices)
    {
        $this->couponUsageServices = $couponUsageServices;
    }
    public function index()
    {
        $couponUsages = CouponUsage::with(['user', 'coupon'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $couponUsages
        ]);
    }

    public function show($id)
    {
        $couponUsage = CouponUsage::with(['user', 'coupon'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $couponUsage
        ]);
    }
    public function store(CouponRequests $request)
    {
        $couponUsage = $this->couponUsageServices->createCouponUsage($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Coupon usage created successfully',
            'data' => $couponUsage
        ], 201);
    }
    

} 