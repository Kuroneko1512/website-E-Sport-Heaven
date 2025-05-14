<?php

namespace App\Http\Controllers\Api\Profile\V1;

use App\Services\ShippingAddress\ShippingAddressService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ShippingAddressController extends Controller
{
    protected $shippingAddressService;

    public function __construct(ShippingAddressService $shippingAddressService)
    {
        $this->shippingAddressService = $shippingAddressService;
    }

    /**
     * Format response chuẩn cho API
     *
     * @param bool $success
     * @param string $message
     * @param array $data
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    private function responseJson($success, $message = '', $data = [], $code = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Lấy danh sách địa chỉ giao hàng của khách hàng
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $addresses = $this->shippingAddressService->getAllByCustomer($customer);
                
            return $this->responseJson(true, 'Danh sách địa chỉ giao hàng', $addresses, 200);
        } catch (\Throwable $th) {
            Log::error('Error fetching shipping addresses: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Lưu địa chỉ giao hàng mới
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $validator = Validator::make($request->all(), [
                'recipient_name' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'address_line1' => 'required|string',
                'address_line2' => 'nullable|string',
                'province_code' => 'required|exists:provinces,code',
                'district_code' => 'required|exists:districts,code',
                'commune_code' => 'required|exists:communes,code',
                'postal_code' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:50',
                'is_default' => 'boolean',
                'notes' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return $this->responseJson(false, 'Dữ liệu không hợp lệ', ['errors' => $validator->errors()], 422);
            }
            
            // Lấy dữ liệu từ request
            $data = $request->all();
            
            // Gán email của user đăng nhập vào địa chỉ giao hàng
            $data['email'] = $user->email;
            
            $address = $this->shippingAddressService->createForCustomer($customer, $data);
            
            return $this->responseJson(true, 'Địa chỉ giao hàng đã được thêm', $address, 201);
        } catch (\Throwable $th) {
            Log::error('Error creating shipping address: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Hiển thị chi tiết địa chỉ giao hàng
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $address = $this->shippingAddressService->getByIdForCustomer($customer, $id);
                
            return $this->responseJson(true, 'Chi tiết địa chỉ giao hàng', $address, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->responseJson(false, 'Không tìm thấy địa chỉ giao hàng', [], 404);
        } catch (\Throwable $th) {
            Log::error('Error fetching shipping address: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Cập nhật địa chỉ giao hàng
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $validator = Validator::make($request->all(), [
                'recipient_name' => 'string|max:100',
                'phone' => 'string|max:20',
                // Loại bỏ email khỏi validation vì sẽ sử dụng email của user
                'address_line1' => 'string',
                'address_line2' => 'nullable|string',
                'province_code' => 'exists:provinces,code',
                'district_code' => 'exists:districts,code',
                'commune_code' => 'exists:communes,code',
                'postal_code' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:50',
                'is_default' => 'boolean',
                'notes' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return $this->responseJson(false, 'Dữ liệu không hợp lệ', ['errors' => $validator->errors()], 422);
            }
            
            // Lấy dữ liệu từ request
            $data = $request->all();
            
            // Gán email của user đăng nhập vào địa chỉ giao hàng
            $data['email'] = $user->email;
            
            $address = $this->shippingAddressService->updateForCustomer($customer, $id, $data);
            
            return $this->responseJson(true, 'Địa chỉ giao hàng đã được cập nhật', $address, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->responseJson(false, 'Không tìm thấy địa chỉ giao hàng', [], 404);
        } catch (\Throwable $th) {
            Log::error('Error updating shipping address: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Xóa địa chỉ giao hàng
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $this->shippingAddressService->deleteForCustomer($customer, $id);
            
            return $this->responseJson(true, 'Địa chỉ giao hàng đã được xóa', [], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->responseJson(false, 'Không tìm thấy địa chỉ giao hàng', [], 404);
        } catch (\Throwable $th) {
            Log::error('Error deleting shipping address: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Đặt địa chỉ làm mặc định
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function setDefault(Request $request, $id)
    {
        try {
            $user = $request->user();
            $customer = $user->customer;
            
            if (!$customer) {
                return $this->responseJson(false, 'Không tìm thấy thông tin khách hàng', [], 404);
            }
            
            $address = $this->shippingAddressService->setDefaultForCustomer($customer, $id);
            
            return $this->responseJson(true, 'Đã đặt địa chỉ làm mặc định', $address, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->responseJson(false, 'Không tìm thấy địa chỉ giao hàng', [], 404);
        } catch (\Throwable $th) {
            Log::error('Error setting default address: ' . $th->getMessage(), [
                'trace' => $th->getTraceAsString()
            ]);
            
            return $this->responseJson(false, 'Lỗi hệ thống', ['error' => $th->getMessage()], 500);
        }
    }
}
