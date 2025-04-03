<?php

namespace App\Services\Auth;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use App\Enums\RolesEnum;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthService
{
    /**
     * @var CustomerAuthService
     */
    protected $customerAuthService;

    /**
     * @var MediaService
     */
    protected $mediaService;

    /**
     * Khởi tạo service với các dependencies
     * 
     * @param CustomerAuthService $customerAuthService Service xử lý xác thực khách hàng
     * @param MediaService $mediaService Service xử lý media
     */
    public function __construct(CustomerAuthService $customerAuthService, MediaService $mediaService)
    {
        $this->customerAuthService = $customerAuthService;
        $this->mediaService = $mediaService;
    }

    /**
     * Tạo URL chuyển hướng đến trang đăng nhập của nhà cung cấp
     * 
     * @param string $provider Tên nhà cung cấp (google, facebook, github)
     * @return string URL chuyển hướng
     */
    public function getRedirectUrl($provider)
    {
        try {
            // Sử dụng Socialite để tạo URL chuyển hướng
            return Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
        } catch (Exception $e) {
            Log::error("Error generating {$provider} redirect URL: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Xử lý đăng nhập từ nhà cung cấp xã hội
     * 
     * @param string $provider Tên nhà cung cấp (google, facebook, github)
     * @param string $token Token từ nhà cung cấp
     * @return array Kết quả xử lý
     */
    public function handleSocialLogin($provider, $token)
    {
        try {
            // Ghi log thông tin đăng nhập
            Log::info("{$provider} login attempt with token", [
                'provider' => $provider
            ]);

            // Xác thực token với nhà cung cấp thông qua Socialite
            $socialUser = Socialite::driver($provider)->stateless()->userFromToken($token);
            
            if (!$socialUser) {
                return [
                    'success' => false,
                    'message' => "Token {$provider} không hợp lệ",
                    'data' => [],
                    'code' => 401
                ];
            }

            // Kiểm tra xem email đã tồn tại chưa
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Nếu người dùng đã tồn tại, kiểm tra provider
                if ($user->provider !== $provider) {
                    // Nếu tài khoản đã tồn tại nhưng không phải từ provider hiện tại
                    return [
                        'success' => false,
                        'message' => "Email này đã được đăng ký bằng phương thức khác ({$user->provider})",
                        'data' => [],
                        'code' => 400
                    ];
                }

                // Đăng nhập người dùng hiện có
                return $this->loginExistingUser($user);
            } else {
                // Nếu người dùng chưa tồn tại, đăng ký mới
                return $this->registerNewSocialUser($socialUser, $provider);
            }
        } catch (Exception $e) {
            Log::error("{$provider} login failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => "Đã xảy ra lỗi trong quá trình đăng nhập với {$provider}",
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }

    /**
     * Đăng nhập người dùng hiện có
     * 
     * @param User $user Đối tượng người dùng
     * @return array Kết quả đăng nhập
     */
    protected function loginExistingUser($user)
    {
        try {
            // Sử dụng service đăng nhập hiện có để tạo token
            $result = $this->customerAuthService->attemptLoginWithoutPassword($user);
            return $result;
        } catch (Exception $e) {
            Log::error('Error creating token for existing user: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Đăng ký người dùng mới từ thông tin xã hội
     * 
     * @param \Laravel\Socialite\Two\User $socialUser Thông tin người dùng từ nhà cung cấp
     * @param string $provider Tên nhà cung cấp
     * @return array Kết quả đăng ký và đăng nhập
     */
    protected function registerNewSocialUser($socialUser, $provider)
    {
        try {
            DB::beginTransaction();
            
            // Chuẩn bị dữ liệu người dùng
            $userData = [
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'account_type' => 'customer',
                'is_active' => true,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'email_verified_at' => now(), // Đánh dấu email đã được xác thực
                'password' => Hash::make(env('SOCIAL_AUTH_DEFAULT_PASSWORD', 'SocialAuth@2024!')), // Mật khẩu mặc định an toàn
            ];
            
            // Xử lý avatar từ nhà cung cấp
            try {
                if ($socialUser->getAvatar()) {
                    // Tải avatar từ URL của nhà cung cấp
                    $avatarData = $this->mediaService->processImage($socialUser->getAvatar(), 'avatar');
                    
                    if ($avatarData && isset($avatarData['url'])) {
                        $userData['avatar'] = $avatarData['url'];
                        
                        if (isset($avatarData['public_id'])) {
                            $userData['avatar_public_id'] = $avatarData['public_id'];
                        }
                    }
                } else {
                    // Sử dụng avatar mặc định
                    $avatarData = $this->mediaService->processDefaultAvatar();
                    
                    if ($avatarData && isset($avatarData['url'])) {
                        $userData['avatar'] = $avatarData['url'];
                        
                        if (isset($avatarData['public_id'])) {
                            $userData['avatar_public_id'] = $avatarData['public_id'];
                        }
                    }
                }
            } catch (Exception $e) {
                Log::error('Avatar processing failed: ' . $e->getMessage());
                // Tiếp tục mà không có avatar
            }
            
            // Tạo người dùng mới
            $user = User::create($userData);
            
            // Gán vai trò khách hàng
            $user->assignRole(RolesEnum::Customer->value);
            
            // Tách tên đầy đủ thành tên và họ
            $names = $this->splitName($socialUser->getName());
            
            // Tạo hồ sơ khách hàng
            Customer::create([
                'user_id' => $user->id,
                'first_name' => $names['first_name'],
                'last_name' => $names['last_name'],
                'gender' => null,
                'birthdate' => null,
            ]);
            
            DB::commit();
            
            // Đăng nhập người dùng mới
            return $this->loginExistingUser($user);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error registering new user from {$provider}: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Tách tên đầy đủ thành tên và họ
     * 
     * @param string $fullName Tên đầy đủ
     * @return array Mảng chứa first_name và last_name
     */
    protected function splitName($fullName)
    {
        $parts = explode(' ', $fullName);
        
        if (count($parts) > 1) {
            $lastName = array_shift($parts);
            $firstName = implode(' ', $parts);
        } else {
            $firstName = $fullName;
            $lastName = '';
        }
        
        return [
            'first_name' => $firstName,
            'last_name' => $lastName
        ];
    }
}