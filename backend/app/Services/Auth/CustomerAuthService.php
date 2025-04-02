<?php

namespace App\Services\Auth;

use Exception;
use App\Models\User;
use App\Enums\RolesEnum;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

    // Đăng ký tài khoản mới cho Customer
    public function register($data)
    {
        try {
            // Validate dữ liệu
            $validator = $this->validateRegisterData($data);

            if ($validator->fails()) {
                return [
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'data' => $validator->errors(),
                    'code' => 422
                ];
            }

            DB::beginTransaction();

            // Chuẩn bị dữ liệu user với avatar cố định
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'account_type' => 'customer',
                'is_active' => true,
                'avatar' => 'https://res.cloudinary.com/dv5p8avz7/image/upload/v1743589352/avatars/avatar_rsrdx9XAHC_1743589353.jpg'
            ];

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
            Log::error('Registration failed: ' . $e->getMessage());
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
