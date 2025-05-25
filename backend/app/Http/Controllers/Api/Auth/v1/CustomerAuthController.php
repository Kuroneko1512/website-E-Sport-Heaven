<?php

namespace App\Http\Controllers\Api\Auth\v1;

use App\Http\Controllers\Controller;
use App\Services\Auth\CustomerAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class CustomerAuthController extends Controller
{
    protected $customerAuthService;

    public function __construct(CustomerAuthService $customerAuthService)
    {
        $this->customerAuthService = $customerAuthService;
    }

    // Format response chuẩn cho API
    private function responseJson($success, $message = '', $data = [], $code = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    // Đăng nhập customer
    public function login(Request $request)
    {
        // Validate dữ liệu
        $validator = $this->customerAuthService->validateLoginData($request->all());
        
        if ($validator->fails()) {
            return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
        }

        // Thực hiện đăng nhập
        $result = $this->customerAuthService->attemptLogin(
            $request->identifier,
            $request->password
        );

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    // Đăng ký tài khoản mới
    public function register(Request $request)
    {
        $result = $this->customerAuthService->register($request->all());

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    // Làm mới token
    public function refreshToken(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
        }

        $result = $this->customerAuthService->refreshToken($request->refresh_token);

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        $result = $this->customerAuthService->logout($request);

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    // Cập nhật thông tin tài khoản
    public function updateAccount(Request $request)
    {
        $result = $this->customerAuthService->updateUser($request);

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link.'], 500);
    }

    public function showResetForm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link.'], 500);
    }
    
}
