<?php

namespace App\Services\Auth;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\AdminActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\TokenRepository;
use Illuminate\Support\Facades\Validator;
use Laravel\Passport\RefreshTokenRepository;

class AuthService
{
    protected $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    // Xác thực đăng nhập
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
                'user only' => $user ? $user->only(['id', 'email', 'phone', 'account_type']) : null,
            ]);

            // Kiểm tra mật khẩu
            if (!$user || !Hash::check($password, $user->password)) {
                Log::warning('Login attempt failed for identifier: ' . $identifier, [
                    'account_type' => $accountType,
                    'time' => now(),
                ]);

                // Hook cho xử lý đăng nhập thất bại
                $this->handleFailedLogin($identifier, $accountType);

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
                'scope' => '*',
            ];


            Log::info('Sending request to OAuth token endpoint', [
                'url' => config('app.url') . '/oauth/token',
                'data' => $dataToSend,
                'data 2' => array_merge($dataToSend, ['client_secret' => '***']), // Ẩn client secret trong log
            ]);

            // Tạo request nội bộ
            $tokenRequest = Request::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Authentication failed: ' . ($data['message'] ?? 'Unknown error'));
            }

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

            // Hook cho xử lý đăng nhập thành công
            $this->handleSuccessfulLogin($user, request()->ip(), request()->userAgent());

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
                        'avatar' => $user->avatar,
                    ],
                    'role' => $user->roles()->pluck('name'),
                    'permission' => $user->getPermissionsViaRoles()->pluck('name')
                ],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Login failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
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
     * Hook xử lý khi đăng nhập thành công
     * Các lớp con có thể ghi đè phương thức này để xử lý log
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @return void
     */
    protected function handleSuccessfulLogin($user, $ipAddress, $userAgent)
    {
        // Phương thức trống để các lớp con ghi đè
    }

    /**
     * Hook xử lý khi đăng nhập thất bại
     * Các lớp con có thể ghi đè phương thức này để xử lý log
     * 
     * @param string $identifier
     * @param string $accountType
     * @return void
     */
    protected function handleFailedLogin($identifier, $accountType)
    {
        // Phương thức trống để các lớp con ghi đè
    }

    // Làm mới token
    // Làm mới token
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
                'scope' => '*',
            ];

            Log::info('Sending request to OAuth token endpoint for refresh', [
                'url' => config('app.url') . '/oauth/token',
                'data' => array_merge($dataToSend, ['client_secret' => '***']), // Ẩn client secret trong log
            ]);

            // Tạo request nội bộ
            $tokenRequest = Request::create('/oauth/token', 'POST', $dataToSend);

            // Dispatch request nội bộ
            $response = app()->handle($tokenRequest);

            $data = json_decode($response->getContent(), true);

            if ($response->getStatusCode() !== 200) {
                throw new Exception('Refresh token failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            $tokenPayload = json_decode(base64_decode(explode('.', $data['access_token'])[1]));

            // Thời gian tạo token
            $createdAt = Carbon::createFromTimestamp($tokenPayload->iat);

            // Thời gian hết hạn
            $expiresAt = $createdAt->copy()->addSeconds($data['expires_in']);

            // Lấy thông tin Users
            $userId = $tokenPayload->sub;
            $user = User::findOrFail($userId);

            // Lấy token ID (jti) từ payload
            $tokenId = $tokenPayload->jti ?? null;

            // Ghi log phản hồi
            Log::info('Response from OAuth token endpoint', [
                'status' => $response->getStatusCode(),
                'iat' => $tokenPayload->iat,
                'user_id' => $tokenPayload->sub,
                'expires_in' => $data['expires_in'],
                'now' => now()->toDateTimeString(),
                'created_at' => $createdAt->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
                'token_id' => $tokenId,
            ]);

            // Gọi hook để xử lý log làm mới token
            $this->handleSuccessfulTokenRefresh($user, request()->ip(), request()->userAgent(), $tokenId);

            // Trả về thông tin chi tiết
            return [
                'success' => true,
                'message' => 'Làm mới token thành công',
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
            Log::error('Refresh token failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
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
     * Hook xử lý khi làm mới token thành công
     * Các lớp con có thể ghi đè phương thức này để xử lý log
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @param string|null $tokenId
     * @return void
     */
    protected function handleSuccessfulTokenRefresh($user, $ipAddress, $userAgent, $tokenId = null)
    {
        // Phương thức trống để các lớp con ghi đè
    }

    /**
     * Hook xử lý khi đăng xuất thành công
     * Các lớp con có thể ghi đè phương thức này để xử lý log
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @param string|null $tokenId
     * @return void
     */
    protected function handleSuccessfulLogout($user, $ipAddress, $userAgent, $tokenId = null)
    {
        // Phương thức trống để các lớp con ghi đè
    }

    // Đăng xuất
    // Đăng xuất
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
            $bearerToken = $request->bearerToken();
            $tokenId = null;

            if ($bearerToken) {
                try {
                    // Giải mã JWT để lấy jti (JWT ID)
                    $tokenParts = explode('.', $bearerToken);

                    if (count($tokenParts) === 3) {
                        $payload = json_decode(base64_decode($tokenParts[1]), true);
                        if (isset($payload['jti'])) {
                            $tokenId = $payload['jti'];

                            // Khởi tạo repositories
                            $tokenRepository = app(TokenRepository::class);
                            $refreshTokenRepository = app(RefreshTokenRepository::class);

                            // Thu hồi access token
                            $tokenRepository->revokeAccessToken($tokenId);

                            // Thu hồi tất cả refresh token liên quan
                            $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);

                            Log::info('Token đã được thu hồi', [
                                'token_id' => $tokenId,
                                'method' => 'jti'
                            ]);
                        } else {
                            Log::warning('Không tìm thấy jti trong JWT payload');
                        }
                    } else {
                        Log::warning('Token không có định dạng JWT hợp lệ');
                    }

                    // Nếu không thể thu hồi bằng jti, thử thu hồi tất cả token của user
                    if (!$tokenId) {
                        DB::table('oauth_access_tokens')
                            ->where('user_id', $user->id)
                            ->where('revoked', 0)
                            ->update(['revoked' => true]);

                        Log::info('Đã thu hồi tất cả token của user', [
                            'user_id' => $user->id,
                            'method' => 'fallback'
                        ]);
                    }
                } catch (Exception $tokenException) {
                    Log::warning('Lỗi khi thu hồi token: ' . $tokenException->getMessage());

                    // Fallback: Thu hồi tất cả token của user
                    DB::table('oauth_access_tokens')
                        ->where('user_id', $user->id)
                        ->where('revoked', 0)
                        ->update(['revoked' => true]);
                }
            } else {
                Log::warning('Không tìm thấy bearer token trong request');

                // Thu hồi tất cả token của user
                DB::table('oauth_access_tokens')
                    ->where('user_id', $user->id)
                    ->where('revoked', 0)
                    ->update(['revoked' => true]);
            }

            // Gọi hook để xử lý log đăng xuất
            $this->handleSuccessfulLogout($user, $request->ip(), $request->userAgent(), $tokenId);

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



    // Xác thực dữ liệu đăng nhập
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

    // Cập nhật thống tin người dùng
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
                'name',
                'email',
                'phone',
                'password',
                'avatar'
            ]);

            $validator = Validator::make($data, [
                'name' => 'string|max:255',
                'email' => 'email|unique:users,email,' . $user->id,
                'phone' => 'string|unique:users,phone,' . $user->id,
                'password' => 'nullable|string|min:8|confirmed',
                'password_confirmation' => 'nullable|string|min:8',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
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

            // Kiểm tra xem có dữ liệu nào cần cập nhật không
            $hasChanges = false;
            $fieldsToTrack = ['name', 'email', 'phone'];
            $updateData = [];

            // Kiểm tra các trường cơ bản
            foreach ($fieldsToTrack as $field) {
                if (isset($data[$field]) && $data[$field] !== $user->$field) {
                    $updateData[$field] = $data[$field];
                    $hasChanges = true;
                }
            }

            // Kiểm tra mật khẩu
            $passwordChanged = isset($data['password']) && !empty($data['password']);
            if ($passwordChanged) {
                $updateData['password'] = Hash::make($data['password']);
                $hasChanges = true;
            }

            // Xử lý avatar nếu có
            if ($request->hasFile('avatar')) {
                try {
                    // Xóa avatar cũ nếu có
                    if (!empty($user->avatar) && strpos($user->avatar, 'cloudinary') !== false) {
                        // Trích xuất public_id từ URL Cloudinary
                        $publicId = null;
                        if (preg_match('/\/v\d+\/([^\/]+)\/([^\.]+)/', $user->avatar, $matches)) {
                            $publicId = $matches[1] . '/' . $matches[2];
                            $this->mediaService->deleteImage($publicId);
                        }
                    }
                    // Upload avatar mới
                    $avatarResult = $this->mediaService->processAvatar($request->file('avatar'));
                    $updateData['avatar'] = $avatarResult['url'];
                    $hasChanges = true;

                    Log::info('Avatar uploaded successfully', [
                        'public_id' => $avatarResult['public_id'],
                        'url' => $avatarResult['url']
                    ]);
                } catch (Exception $e) {
                    Log::error('Error uploading avatar', [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Nếu có lỗi khi upload, không cập nhật avatar
                }
            }

            // Nếu không có thay đổi, trả về thông báo thành công luôn
            if (!$hasChanges) {
                DB::commit();
                return [
                    'success' => true,
                    'message' => 'Không có thông tin nào được thay đổi',
                    'data' => $user,
                    'code' => 200
                ];
            }

            // Lưu giá trị cũ TRƯỚC KHI cập nhật
            $oldValues = [];
            foreach (array_keys($updateData) as $field) {
                if ($field !== 'password') {
                    $oldValues[$field] = $user->$field;
                }
            }

            if ($passwordChanged) {
                $oldValues['password'] = '[HIDDEN]';
            }

            // Cập nhật user với dữ liệu đã thay đổi
            $user->update($updateData);

            // Chuẩn bị giá trị mới cho log
            $newValues = [];
            foreach (array_keys($updateData) as $field) {
                if ($field !== 'password') {
                    $newValues[$field] = $user->$field;
                }
            }

            if ($passwordChanged) {
                $newValues['password'] = '[HIDDEN]';
            }

            // Xác định các trường đã thay đổi
            $changedFields = array_keys($updateData);

            // Gọi phương thức hook để các lớp con có thể xử lý log
            if (!empty($changedFields)) {
                $this->afterUserUpdate($request, $user, $oldValues, $newValues, $changedFields);
            }

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


    /**
     * Hook được gọi sau khi cập nhật thông tin người dùng
     * Các lớp con có thể ghi đè phương thức này để xử lý log
     * 
     * @param Request $request
     * @param User $user
     * @param array $oldValues
     * @param array $newValues
     * @param array $changedFields
     * @return void
     */
    protected function afterUserUpdate(Request $request, $user, $oldValues, $newValues, $changedFields)
    {
        // Phương thức trống để các lớp con ghi đè
    }
}
