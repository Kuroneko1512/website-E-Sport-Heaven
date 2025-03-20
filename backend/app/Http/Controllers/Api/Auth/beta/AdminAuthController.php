<?php

namespace App\Http\Controllers\Api\Auth\beta;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request as HttpRequest;

class AdminAuthController extends Controller
{
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

    public function login(Request $request)
    {

        try {
            // Ghi log dữ liệu nhận vào
            Log::info('Received login request', [
                'request_data' => $request->all(),
                'ip' => $request->ip(),
            ]);

            $validator = Validator::make($request->all(), [
                'identifier' => [
                    'required',
                    'string',
                    function ($attribute, $value, $fail) {
                        $exists = User::where('email', $value)->orWhere('phone', $value)->exists();
                        if (!$exists) {
                            $fail('Số điện thoại hoặc email không tồn tại');
                        }
                    },
                ],
                'password' => 'required|string|min:6',
            ], [
                'identifier.required' => 'Số điện thoại hoặc email không được để trống',
                'password.required' => 'Mật khẩu không được để trống',
            ]);

            // Ghi log dữ liệu validate
            Log::info('Validation data', [
                'validation_errors' => $validator->errors(),
            ]);

            if ($validator->fails()) {
                return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
            }
            // Log::info('Identifier being checked', ['identifier' => $request->identifier]);
            // // Làm sạch dữ liệu identifier
            // $identifier = trim($request->identifier);
            // // Log loại dữ liệu
            // Log::info('Type of identifier', ['type' => gettype($identifier), 'value' => $identifier]);
            // // Log câu truy vấn
            // $query = User::where('phone', $identifier)
            //     ->orWhere('email', $identifier);
            // Log::info('Query being executed', ['query' => $query->toSql(), 'bindings' => $query->getBindings()]);

            // // Kiểm tra số điện thoại hoặc email
            // $user = $query->first();
            // Kiểm tra số điện thoại hoặc email
            $user = User::where('phone', $request->identifier)
                ->orWhere('email', $request->identifier)
                ->first();

            // Ghi log thông tin khách hàng
            Log::info('Customer data', [
                'customer' => $user,
            ]);

            // Kiểm tra mật khẩu
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Login attempt failed for identifier: ' . $request->identifier, [
                    'ip' => $request->ip(),
                    'time' => now(),
                ]);
                return $this->responseJson(false, 'Thông tin đăng nhập không hợp lệ', [], 401);
            }

            // Gửi yêu cầu đăng nhập
            $dataToSend = [
                'grant_type' => 'password',
                'client_id' => env('PASSPORT_CUSTOMER_CLIENT_ID'),
                'client_secret' => env('PASSPORT_CUSTOMER_CLIENT_SECRET'),
                'username' => $user->phone ?? $user->email,
                'password' => $request->password,
                'scope' => '',
            ];

            Log::info('Sending request to OAuth token endpoint', [
                'url' => config('app.url') . '/oauth/token',
                'data' => $dataToSend,
            ]);

            // $response = Http::asForm()->post(config('app.url') . '/oauth/token', $dataToSend);

            // Tạo request nội bộ
            $tokenRequest = HttpRequest::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            // Ghi log phản hồi
            Log::info('Response from OAuth token endpoint', [
                'response' => $data,
                'status' => $response->getStatusCode(),
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Authentication failed');
            }

            // Trả về thông tin chi tiết
            return $this->responseJson(
                true,
                'Đăng nhập thành công',
                [
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_type' => 'Bearer',
                    'expires_at' => $data['expires_in'], // Thời gian hết hạn
                    'customer' => [
                        'id' => $user->id,
                        'phone' => $user->phone,
                        'email' => $user->email,
                        'full_name' => $user->name,
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Login failed: ' . $e->getMessage());
            return $this->responseJson(
                false,
                'Đã xảy ra lỗi trong quá trình đăng nhập',
                [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                500
            );
        }
    }

    public function refreshToken(Request $request)
    {
        try {
            // Ghi log dữ liệu nhận vào
            Log::info('Received refresh token request', [
                'request_data' => $request->all(),
                'ip' => $request->ip(),
            ]);

            // Xác thực refresh_token
            $validator = Validator::make($request->all(), [
                'refresh_token' => 'required|string',
            ], [
                'refresh_token.required' => 'Refresh token không được để trống',
            ]);

            if ($validator->fails()) {
                return $this->responseJson(false, 'Invalid request', $validator->errors(), 422);
            }

            // Gửi yêu cầu để lấy access token mới
            $dataToSend = [
                'grant_type' => 'refresh_token',
                'refresh_token' => $request->refresh_token,
                'client_id' => env('PASSPORT_CUSTOMER_CLIENT_ID'),
                'client_secret' => env('PASSPORT_CUSTOMER_CLIENT_SECRET'),
                'scope' => '',
            ];

            Log::info('Sending request to OAuth token endpoint for refresh', [
                'url' => config('app.url') . '/oauth/token',
                'data' => $dataToSend,
            ]);

            // Tạo request nội bộ
            $tokenRequest = HttpRequest::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            // Ghi log phản hồi
            Log::info('Response from OAuth token endpoint for refresh', [
                'response' => $data,
                'status' => $response->getStatusCode(),
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Refresh token failed');
            }

            // Trả về thông tin chi tiết
            return $this->responseJson(
                true,
                'Refresh token thành công',
                [
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_type' => 'Bearer',
                    'expires_at' => $data['expires_in'], // Thời gian hết hạn
                ]
            );
        } catch (Exception $e) {
            Log::error('Refresh token failed: ' . $e->getMessage());
            return $this->responseJson(
                false,
                'Đã xảy ra lỗi trong quá trình làm mới token',
                [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                500
            );
        }
    }

    public function logout(Request $request) {
        try {
            DB::beginTransaction();

            $user = $request->user();
            if (!$user) {
                return $this->responseJson(false, 'Người dùng không tồn tại', [], 404);
            }

            // Lấy access token hiện tại của người dùng
            $accessToken = $user->token();

            // Revoke các refresh token liên quan đến access token
            $refreshTokenRepository = app(\Laravel\Passport\RefreshTokenRepository::class);
            $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($accessToken->id);

            // Revoke access token
            $accessToken->revoke();
            

            // Ghi log đăng xuất
            Log::info('Khách hàng đăng xuất', [
                'user_id' => $request->user()->id
            ]);

            DB::commit();
            return $this->responseJson(true, 'Đăng xuất thành công');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi đăng xuất', [
                'message' => $e->getMessage()
            ]);
            return $this->responseJson(false, 'Đăng xuất thất bại', [], 500);
        }
    }
}
