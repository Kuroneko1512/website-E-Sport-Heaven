<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\Api\Admin\V1\AdminResource;
use App\Http\Requests\Api\Admin\V1\Auth\LoginRequest;

class AuthController extends Controller
{
    /**
     * Format response API
     * 
     * @param bool $success
     * @param string $message 
     * @param array $data
     * @param int $code
     * @return JsonResponse
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
     * Admin login
     * 
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request)
    {
        // Validated data từ LoginRequest
        $validated = $request->validated();

        // Tìm admin theo email
        $admin = Admin::where('email', $request->email)->first();

        // Kiểm tra tài khoản và mật khẩu
        if (!$admin || !Hash::check($validated['password'], $admin->password)) {
            return $this->responseJson(
                false,
                'Email hoặc mật khẩu không chính xác',
                [],
                401
            );
        }

        // Kiểm tra trạng thái tài khoản
        if ($admin->status !== 'active') {
            return $this->responseJson(
                false,
                'Tài khoản đã bị khoá hoặc chưa kích hoạt',
                [],
                401
            );
        }

        // Log thông tin đăng nhập thành công
        $admin->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'failed_login_attempts' => 0
        ]);

        $token = $admin->createToken('Admin Access Token')->accessToken;

        return $this->responseJson(
            true,
            'Đăng nhập thành công',
            [
                'admin' => new AdminResource($admin),
                'token' => $token
            ]
        );
    }

    /**
     * Admin logout
     * 
     * @return JsonResponse
     */
    public function logout()
    {
        $admin = Admin::find(Auth::guard('admin')->id());
        $admin->tokens()->delete();

        return $this->responseJson(
            true,
            'Đăng xuất thành công'
        );
    }

    /**
     * Get admin profile
     * 
     * @return JsonResponse
     */
    public function profile()
    {
        $admin = Auth::guard('admin')->user();

        return $this->responseJson(
            true,
            'Lấy thông tin profile thành công',
            ['admin' => new AdminResource($admin)]
        );
    }
}
