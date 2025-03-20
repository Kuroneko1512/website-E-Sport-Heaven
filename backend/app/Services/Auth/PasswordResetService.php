<?php

namespace App\Services\Auth;

use Exception;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PasswordResetService
{
    /**
     * Gửi email reset password
     */
    public function sendResetLink($email, $accountType)
    {
        try {
            // Kiểm tra email tồn tại
            $user = User::where('email', $email)
                        ->where('account_type', $accountType)
                        ->first();
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Email không tồn tại trong hệ thống',
                    'data' => [],
                    'code' => 404
                ];
            }

            // Tạo token reset password
            $token = Str::random(60);
            
            // Lưu token vào database
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($token),
                    'created_at' => Carbon::now()
                ]
            );

            // Tạo URL reset password
            $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . $email;

            // Gửi email
            // Mail::to($email)->send(new ResetPasswordMail($resetUrl));
            
            // Giả lập gửi email (thay bằng code gửi email thực tế)
            Log::info('Reset password email would be sent to: ' . $email, [
                'reset_url' => $resetUrl
            ]);

            return [
                'success' => true,
                'message' => 'Đã gửi email hướng dẫn đặt lại mật khẩu',
                'data' => [],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Send reset link failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi gửi email',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }

    /**
     * Reset password
     */
    public function resetPassword($data)
    {
        try {
            // Validate dữ liệu
            $validator = $this->validateResetData($data);
            
            if ($validator->fails()) {
                return [
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'data' => $validator->errors(),
                    'code' => 422
                ];
            }

            // Kiểm tra token
            $tokenRecord = DB::table('password_reset_tokens')
                            ->where('email', $data['email'])
                            ->first();

            if (!$tokenRecord || !Hash::check($data['token'], $tokenRecord->token)) {
                return [
                    'success' => false,
                    'message' => 'Token không hợp lệ hoặc đã hết hạn',
                    'data' => [],
                    'code' => 400
                ];
            }

            // Kiểm tra thời gian tạo token (thường là 60 phút)
            $tokenCreatedAt = Carbon::parse($tokenRecord->created_at);
            if (Carbon::now()->diffInMinutes($tokenCreatedAt) > 60) {
                return [
                    'success' => false,
                    'message' => 'Token đã hết hạn',
                    'data' => [],
                    'code' => 400
                ];
            }

            // Cập nhật mật khẩu
            $user = User::where('email', $data['email'])->first();
            $user->password = Hash::make($data['password']);
            $user->save();

            // Xóa token đã sử dụng
            DB::table('password_reset_tokens')
                ->where('email', $data['email'])
                ->delete();

            return [
                'success' => true,
                'message' => 'Đặt lại mật khẩu thành công',
                'data' => [],
                'code' => 200
            ];
        } catch (Exception $e) {
            Log::error('Reset password failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi đặt lại mật khẩu',
                'data' => [
                    'message' => 'Lỗi hệ thống, vui lòng thử lại sau.'
                ],
                'code' => 500
            ];
        }
    }

    /**
     * Xác thực dữ liệu reset password
     */
    private function validateResetData($data)
    {
        return Validator::make($data, [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
    }
}