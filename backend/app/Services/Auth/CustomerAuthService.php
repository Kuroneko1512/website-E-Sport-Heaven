<?php

namespace App\Services\Auth;

use Exception;
use App\Models\User;
use App\Enums\RolesEnum;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CustomerAuthService extends AuthService
{
    protected $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }
    // Xác thực đăng nhập cho Customer
    public function attemptLogin($identifier, $password, $accountType = null)
    {
        return parent::attemptLogin($identifier, $password, 'customer');
    }

    // Làm mới token cho Customer
    public function refreshToken($refreshToken, $accountType = null)
    {
        return parent::refreshToken($refreshToken, 'customer');
    }

    /**
     * Đăng nhập không cần mật khẩu (dùng cho đăng nhập xã hội)
     * 
     * @param User $user Đối tượng người dùng đã xác thực qua mạng xã hội
     * @return array Kết quả đăng nhập
     */
    public function attemptLoginWithoutPassword(User $user)
    {
        try {
            // Ghi log
            Log::info('Social login attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'account_type' => $user->account_type,
                'provider' => $user->provider,
                'provider_id' => $user->provider_id
            ]);

            // Cập nhật thông tin người dùng nếu cần
            if (!$user->email_verified_at && $user->provider) {
                // Nếu đăng nhập qua mạng xã hội, coi như email đã được xác thực
                $user->email_verified_at = now();
                $user->save();
            }

            // Tạo một request giả lập để gửi đến OAuth server
            $dataToSend = [
                'grant_type' => 'password',
                'client_id' => env('PASSPORT_CLIENT_ID'),
                'client_secret' => env('PASSPORT_CLIENT_SECRET'),
                'username' => $user->email,
                'password' => env('SOCIAL_AUTH_DEFAULT_PASSWORD', 'SocialAuth@2024!'), // Mật khẩu mặc định an toàn
                'scope' => '*',
                'provider' => $user->provider,
                'provider_id' => $user->provider_id,
                'social_auth' => true // Đánh dấu đây là đăng nhập xã hội
            ];

            Log::info('Sending request to OAuth token endpoint for social login', [
                'url' => config('app.url') . '/oauth/token',
                'data' => array_merge($dataToSend, ['client_secret' => '***', 'password' => '***']), // Ẩn thông tin nhạy cảm
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
            Log::info('Response from OAuth token endpoint for social login', [
                'status' => $response->getStatusCode(),
                'iat' => $tokenPayload->iat,
                'user_id' => $tokenPayload->sub,
                'expires_in' => $data['expires_in'],
                'now' => now()->toDateTimeString(),
                'created_at' => $createdAt->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]);

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
                        'provider' => $user->provider,
                        'provider_id' => $user->provider_id
                    ],
                    'role' => $user->roles()->pluck('name'),
                    'permission' => $user->getPermissionsViaRoles()->pluck('name')
                ],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Social login failed: ' . $e->getMessage(), [
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

    // Đăng ký tài khoản mới cho Customer
    public function register($data)
    {
        try {
            // Validate dữ liệu
            $validator = $this->validateRegisterData($data);

            if ($validator->fails()) {
                return [
                    'success' => false,
                    'message' => 'Wrong request',
                    'data' => $validator->errors(),
                    'code' => 422
                ];
            }

            DB::beginTransaction();

            // Chuẩn bị dữ liệu user
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'account_type' => 'customer',
                'is_active' => true,
            ];

            // Xử lý avatar
            try {
                // Nếu người dùng tải lên avatar
                if (isset($data['avatar'])) {
                    $avatarData = $this->mediaService->processAvatar($data['avatar']);
                } else {
                    // Sử dụng avatar mặc định duy nhất
                    $avatarData = $this->mediaService->processDefaultAvatar();
                }

                if ($avatarData && isset($avatarData['url'])) {
                    $userData['avatar'] = $avatarData['url'];

                    // Nếu model User có trường avatar_public_id, lưu public_id để dễ dàng xóa sau này
                    if (isset($avatarData['public_id'])) {
                        $userData['avatar_public_id'] = $avatarData['public_id'];
                    }
                }

                Log::info('Avatar processed for registration', $avatarData ?? []);
            } catch (Exception $e) {
                Log::error('Avatar upload failed: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                // Tiếp tục đăng ký mà không có avatar
            }

            // Tạo user mới
            $user = User::create($userData);

            // Tạo role cho user
            $user->assignRole(RolesEnum::Customer->value);

            // Tạo customer profile
            Customer::create([
                'user_id' => $user->id,
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'gender' => $data['gender'] ?? null,
                'birthdate' => $data['birthdate'] ?? null,
            ]);

            DB::commit();

            // Đăng nhập tự động sau khi đăng ký
            $loginResult = $this->attemptLogin($data['email'], $data['password']);

            if ($loginResult['success']) {
                return [
                    'success' => true,
                    'message' => 'Đăng ký thành công',
                    'data' => $loginResult['data'],
                    'code' => 201
                ];
            } else {
                return [
                    'success' => true,
                    'message' => 'Đăng ký thành công, vui lòng đăng nhập',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'email' => $user->email,
                            'name' => $user->name,
                            'avatar' => $user->avatar,
                        ]
                    ],
                    'code' => 201
                ];
            }
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Registration failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi trong quá trình đăng ký',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }
    // Xác thực dữ liệu đăng ký
    private function validateRegisterData($data)
    {
        return Validator::make($data, [
            'name' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'gender' => 'nullable|in:male,female,other',
            'birthdate' => 'nullable|date',
        ], [
            'name.required' => 'Tên không được để trống',
            'name.unique' => 'Tên đã tồn tại',
            'email.required' => 'Email không được để trống',
            'email.email' => 'Email không đúng định dạng',
            'email.unique' => 'Email đã tồn tại',
            'phone.unique' => 'Số điện thoại đã tồn tại',
            'password.required' => 'Mật khẩu không được để trống',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'password.confirmed' => 'Mật khẩu không khớp',
            'first_name.max' => 'Tên không được quá 255 ký tự',
            'last_name.max' => 'Hoạt động khó quá 255 ký tự',
            'gender.in' => 'Giới tính không hợp lệ',
            'birthdate.date' => 'Ngày sinh không hợp lệ',
            'birthdate.before' => 'Ngày sinh không hợp lệ',
        ]);
    }
}
