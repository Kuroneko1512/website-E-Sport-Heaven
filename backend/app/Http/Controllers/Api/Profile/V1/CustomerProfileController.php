<?php

namespace App\Http\Controllers\Api\Profile\V1;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CustomerProfileController extends Controller
{
    /**
     * Get customer profile
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            Log::info('Customer ID: ' . $user->id);
            $customer = Customer::where('user_id', $user->id)->first();
            return response()->json([
                'success' => true,
                'message' => 'Thông tin khách hàng',
                'data' => $customer,
                'code' => 200
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống',
                'data' => $th->getMessage(),
                'code' => 500
            ]);
        }
    }

        /**
         * Update customer profile
         *
         * @param \Illuminate\Http\Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();            
            $customer = Customer::where('user_id', $user->id)->first();
            
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thông tin khách hàng',
                    'code' => 404
                ], 404);
            }
            
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'gender' => 'nullable|in:male,female,other',
                'birthdate' => 'nullable|date',
                'bio' => 'nullable|string',
                'preferred_contact_method' => 'nullable|string',
                'preferences' => 'nullable|json'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors(),
                    'code' => 422
                ]);
            }
            
            // Update customer data with validated fields
            $customer->fill($request->only([
                'first_name',
                'last_name',
                'gender',
                'birthdate',
                'bio',
                'preferred_contact_method',
                'preferences'
            ]));
            
            // Save the updated customer
            $customer->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin thành công',
                'data' => $customer,
                'code' => 200
            ]);
        } catch (\Throwable $e) {
            Log::error('Error updating customer profile: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi cập nhật thông tin',
                'error' => $e->getMessage(),
                'code' => 500
            ], 500);
        }
    }
}
