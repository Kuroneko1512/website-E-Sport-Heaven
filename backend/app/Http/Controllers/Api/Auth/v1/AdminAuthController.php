<?php

namespace App\Http\Controllers\Api\Auth\v1;

use App\Http\Controllers\Controller;
use App\Services\Auth\AdminAuthService;
use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    protected $adminAuthService;

    public function __construct(AdminAuthService $adminAuthService)
    {
        $this->adminAuthService = $adminAuthService;
    }

    /**
     * Format response chuẩn cho API
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
     * Đăng nhập admin
     */
    public function login(Request $request)
    {
        // Validate dữ liệu
        $validator = $this->adminAuthService->validateLoginData($request->all());
        
        if ($validator->fails()) {
            return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
        }

        // Thực hiện đăng nhập
        $result = $this->adminAuthService->attemptLogin(
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

    /**
     * Làm mới token
     */
    public function refreshToken(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
        }

        $result = $this->adminAuthService->refreshToken($request->refresh_token);

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }

    /**
     * Đăng xuất
     */
    public function logout(Request $request)
    {
        $result = $this->adminAuthService->logout($request->user());

        return $this->responseJson(
            $result['success'],
            $result['message'],
            $result['data'],
            $result['code']
        );
    }
}
