<?php

namespace App\Http\Controllers\Api\Auth\v1;

use App\Http\Controllers\Controller;
use App\Services\Auth\SocialAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Service xử lý đăng nhập xã hội
     * 
     * @var SocialAuthService
     */
    protected $socialAuthService;

    /**
     * Khởi tạo controller với dependencies
     * 
     * @param SocialAuthService $socialAuthService
     */
    public function __construct(SocialAuthService $socialAuthService)
    {
        $this->socialAuthService = $socialAuthService;
    }

    /**
     * Lấy URL chuyển hướng đến trang đăng nhập của nhà cung cấp
     * 
     * @param Request $request
     * @param string $provider Tên nhà cung cấp (google, facebook, github)
     * @return \Illuminate\Http\JsonResponse
     */
    public function redirectToProvider(Request $request, $provider)
    {
        try {
            // Kiểm tra provider có hợp lệ không
            if (!in_array($provider, ['google', 'facebook', 'github'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nhà cung cấp không được hỗ trợ',
                    'data' => [],
                    'code' => 400
                ], 400);
            }

            // Lấy URL chuyển hướng
            $url = $this->socialAuthService->getRedirectUrl($provider);
            
            return response()->json([
                'success' => true,
                'message' => "URL chuyển hướng đến {$provider}",
                'data' => [
                    'url' => $url
                ],
                'code' => 200
            ]);
        } catch (\Exception $e) {
            Log::error("Error generating {$provider} redirect URL: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tạo URL chuyển hướng',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ], 500);
        }
    }

    /**
     * Xử lý callback từ nhà cung cấp xã hội
     * 
     * @param Request $request
     * @param string $provider Tên nhà cung cấp (google, facebook, github)
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        Log::info('Social callback received', [
            'provider' => $provider,
            'request_data' => $request->all(),
            'headers' => $request->header()
        ]);
        
        try {
            // Kiểm tra provider có hợp lệ không
            if (!in_array($provider, ['google', 'facebook', 'github'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nhà cung cấp không được hỗ trợ',
                    'data' => [],
                    'code' => 400
                ], 400);
            }

            // Validate token (authorization code)
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token không hợp lệ',
                    'data' => $validator->errors(),
                    'code' => 422
                ], 422);
            }

            // Lấy thông tin người dùng từ Google bằng authorization code
            try {
                // Đặt code vào request để Socialite có thể sử dụng
                $request->request->add(['code' => $request->token]);
                
                // Lấy thông tin người dùng từ provider
                $socialUser = Socialite::driver($provider)->stateless()->user();
                
                // Xử lý thông tin người dùng
                $result = $this->socialAuthService->handleSocialUserInfo($provider, $socialUser);
                
                return response()->json([
                    'success' => $result['success'],
                    'message' => $result['message'],
                    'data' => $result['data'],
                    'code' => $result['code']
                ], $result['code']);
            } catch (\Exception $e) {
                Log::error("Error getting user info from {$provider}: " . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => "Không thể lấy thông tin người dùng từ {$provider}",
                    'data' => [
                        'message' => $e->getMessage()
                    ],
                    'code' => 500
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error("{$provider} login error: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => "Đã xảy ra lỗi trong quá trình đăng nhập với {$provider}",
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ], 500);
        }
    }
}
