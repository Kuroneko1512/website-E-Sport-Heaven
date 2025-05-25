<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\Coupon\CouponServices;

class CouponsController extends Controller
{
    public $couponService;
    public function __construct(CouponServices $couponService)
    {
        $this->couponService = $couponService;
    }
    public function index(Request $request)
    {
        $perPage = $request->input('limit', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $coupons = $this->couponService->getCouponsPaginated($perPage, $page, $search);

        return response()->json($coupons);
    }

    public function store(Request $request)
    {
        try {
            // Parse JSON string thành array
            $data = json_decode($request->getContent(), true);

            // Validate data
            $validated = $request->validate([
                'code' => 'required|string|unique:coupons',
                'name' => 'required|string',
                'description' => 'nullable|string',
                'discount_value' => 'required|numeric',
                'discount_type' => 'required|integer',
                'min_order_amount' => 'nullable|numeric',
                'max_discount_amount' => 'nullable|numeric',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'max_uses' => 'nullable|integer',
                'is_active' => 'required|boolean'
            ]);

            $coupon = $this->couponService->createCoupon($validated);

            return response()->json($coupon, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tạo mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Coupon $coupon)
    {

        return response()->json($coupon);
    }

    public function update(Request $request, Coupon $coupon)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:255|unique:coupons,code,' . $coupon->id,
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'discount_type' => 'required|integer',
                'discount_value' => 'required|numeric|min:0',
                'min_order_amount' => 'required|numeric|min:0',
                'max_discount_amount' => 'required|numeric|min:0',
                'max_uses' => 'nullable|integer|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $coupon = $this->couponService->updateCoupon($coupon->id, $request->all());

            return response()->json($coupon);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Coupon $coupon)
    {
        $coupon = $this->couponService->deleteCoupon($coupon->id);

        return response()->json(null, 204);
    }
    public function checkCouponCodeExists($code)
    {
        $exists = $this->couponService->checkCouponCodeExists($code);
        return response()->json(['exists' => $exists]);
    }
}
