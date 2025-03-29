<?php

namespace App\Services\Auth;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthService
{
    /**
     * Xác thực đăng nhập
     */
    public function attemptLogin($identifier, $password, $accountType)
    {
        try {
            // Ghi log
            Log::info('Login attempt', [
                'identifier' => $identifier,
                'account_type' => $accountType
            ]);

            // Kiểm tra số điện thoại hoặc email
            $user = User::where(function ($query) use ($identifier) {
                $query->where('phone', $identifier)
                    ->orWhere('email', $identifier);
            })
                ->where('account_type', $accountType)
                ->first();

            // Ghi log thông tin người dùng
            Log::info('User data', [
                'user' => $user,
            ]);

            // Kiểm tra mật khẩu
            if (!$user || !Hash::check($password, $user->password)) {
                Log::warning('Login attempt failed for identifier: ' . $identifier, [
                    'account_type' => $accountType,
                    'time' => now(),
                ]);
                return [
                    'success' => false,
                    'message' => 'Thông tin đăng nhập không hợp lệ',
                    'data' => [],
                    'code' => 401
                ];
            }

            // Gửi yêu cầu đăng nhập
            $dataToSend = [
                'grant_type' => 'password',
                'client_id' => env('PASSPORT_CLIENT_ID'),
                'client_secret' => env('PASSPORT_CLIENT_SECRET'),
                'username' => $user->phone ?? $user->email,
                'password' => $password,
                'scope' => '',
            ];

            Log::info('Sending request to OAuth token endpoint', [
                'url' => config('app.url') . '/oauth/token',
                'data' => $dataToSend,
            ]);

            // Tạo request nội bộ
            $tokenRequest = Request::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            $tokenPayload = json_decode(base64_decode(explode('.', $data['access_token'])[1]));

            // Thời gian tạo token
            $createdAt = Carbon::createFromTimestamp($tokenPayload->iat);

            // Thời gian hết hạn
            $expiresAt = $createdAt->copy()->addSeconds($data['expires_in']);
            
            // Ghi log phản hồi
            Log::info('Response from OAuth token endpoint', [
                'response' => $data,
                'status' => $response->getStatusCode(),
                'iat' => $tokenPayload->iat,
                'user_id' => $tokenPayload->sub,
                'expires_in' => $data['expires_in'],
                'now' => now()->toDateTimeString(),
                'created_at' => $createdAt->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Authentication failed');
            }

            // Trả về thông tin chi tiết
            return [
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'data' => [
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_type' => 'Bearer',
                    'created_at' => $createdAt->toDateTimeString(),
                    'expires_at' => $expiresAt->toDateTimeString(),
                    'expires_in' => $data['expires_in'], // Thời gian hết hạn
                    'user' => [
                        'id' => $user->id,
                        'phone' => $user->phone,
                        'email' => $user->email,
                        'name' => $user->name,
                    ],
                    'role' => $user->roles()->pluck('name'),
                    'permission' => $user->getPermissionsViaRoles()->pluck('name')
                ],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Login failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi trong quá trình đăng nhập',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }

    /**
     * Làm mới token
     */
    public function refreshToken($refreshToken, $accountType)
    {
        try {
            // Ghi log
            Log::info('Refresh token attempt', [
                'account_type' => $accountType
            ]);

            // Gửi yêu cầu để lấy access token mới
            $dataToSend = [
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
                'client_id' => env('PASSPORT_CLIENT_ID'),
                'client_secret' => env('PASSPORT_CLIENT_SECRET'),
                'scope' => '',
            ];

            Log::info('Sending request to OAuth token endpoint for refresh', [
                'url' => config('app.url') . '/oauth/token',
                'data' => $dataToSend,
            ]);

            // Tạo request nội bộ
            $tokenRequest = Request::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            $tokenPayload = json_decode(base64_decode(explode('.', $data['access_token'])[1]));

            // Thời gian tạo token
            $createdAt = Carbon::createFromTimestamp($tokenPayload->iat);

            // Thời gian hết hạn
            $expiresAt = $createdAt->copy()->addSeconds($data['expires_in']);
            
            // Lấy thông tin Users
            $userId = $tokenPayload->sub;
            $user = User::findOrFail($userId);
            // Ghi log phản hồi
            Log::info('Response from OAuth token endpoint', [
                'response' => $data,
                'status' => $response->getStatusCode(),
                'iat' => $tokenPayload->iat,
                'user_id' => $tokenPayload->sub,
                'expires_in' => $data['expires_in'],
                'now' => now()->toDateTimeString(),
                'created_at' => $createdAt->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Refresh token failed');
            }

            // Trả về thông tin chi tiết
            return [
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'data' => [
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_type' => 'Bearer',
                    'created_at' => $createdAt->toDateTimeString(),
                    'expires_at' => $expiresAt->toDateTimeString(),
                    'expires_in' => $data['expires_in'], // Thời gian hết hạn
                    'user' => [
                        'id' => $user->id,
                        'phone' => $user->phone,
                        'email' => $user->email,
                        'name' => $user->name,
                    ],
                    'role' => $user->roles()->pluck('name'),
                    'permission' => $user->getPermissionsViaRoles()->pluck('name')
                ],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Refresh token failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi trong quá trình làm mới token',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }

    /**
     * Đăng xuất
     */
    public function logout(Request $request)
    {
        try {
            DB::beginTransaction();
            $user = $request->user();
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Người dùng không tồn tại',
                    'data' => [],
                    'code' => 404
                ];
            }
            Log::info('Người dùng đăng xuất', [
                'data' => $user->toArray(),
                'request' => $request->all()
            ]);
            
            // Lấy token hiện tại
            $accessToken = $request->bearerToken();

            // Revoke các refresh token liên quan
            $refreshTokenRepository = app(\Laravel\Passport\RefreshTokenRepository::class);
            $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($accessToken);

            // Revoke access token
            $tokenRepository = app(\Laravel\Passport\TokenRepository::class);
            $tokenRepository->revokeAccessToken($accessToken);

            // Ghi log đăng xuất
            Log::info('Người dùng đăng xuất', [
                'data' => $user
            ]);

            DB::commit();
            return [
                'success' => true,
                'message' => 'Đăng xuất thành công',
                'data' => [],
                'code' => 200
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi đăng xuất', [
                'message' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Đăng xuất thất bại',
                'data' => [],
                'code' => 500
            ];
        }
    }

    /**
     * Xác thực dữ liệu đăng nhập
     */
    public function validateLoginData($data)
    {
        return Validator::make($data, [
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
    }

    /**
     * Cập nhật thống tin người dùng
     */
    public function updateUser(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $user = $request->user();
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Người dùng không tồn tại',
                    'data' => $request->all(),
                    'code' => 404
                ];
            }

            $data = $request->only([
                'name', 'email', 'phone', 'password', 'avatar'
            ]);

            $validator = Validator::make($data, [
                'name' => 'string|max:255',
                'email' => 'email|unique:users,email,' . $user->id,
                'phone' => 'string|unique:users,phone,' . $user->id,
                'password' => 'nullable|string|min:8|confirmed',
                'password_confirmation' => 'nullable|string|min:8',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'email.email' => 'Email không đúng định dạng',
                'email.unique' => 'Email đã tồn tại',
                'phone.unique' => 'Số điện thoại đã tồn tại',
                'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
                'avatar.image' => 'Avatar phải là file hình',
                'avatar.mimes' => 'Avatar phải là file JPEG, PNG, JPG, GIF',
                'avatar.max' => 'Dung lượng file không được quá 2MB',
            ]);

            if ($validator->fails()) {
                return [
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'data' => [],
                    'code' => 400
                ];
            }

            // Xử lý avatar nếu có
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = $path;
            }

            // Hash password nếu có thay đổi
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            DB::commit();
            return [
                'success' => true,
                'message' => 'Cập nhật thành công',
                'data' => $user,
                'code' => 200
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi cập nhật thông tin', [
                'message' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Cập nhật thất bại',
                'data' => [],
                'code' => 500
            ];
        }
    }
}
