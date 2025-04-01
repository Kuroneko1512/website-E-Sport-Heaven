<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use App\Models\AdminActivity;
use App\Models\AdminLoginHistory;
use Illuminate\Support\Facades\Log;

class AdminAuthService extends AuthService
{
    /**
     * Xác thực đăng nhập cho Admin
     * 
     * @param string $identifier Email hoặc số điện thoại
     * @param string $password Mật khẩu
     * @param string|null $accountType Loại tài khoản (mặc định là 'admin')
     * @return array
     */
    public function attemptLogin($identifier, $password, $accountType = null)
    {
        return parent::attemptLogin($identifier, $password, 'admin');
    }

    /**
     * Làm mới token cho Admin
     * 
     * @param string $refreshToken Token làm mới
     * @param string|null $accountType Loại tài khoản (mặc định là 'admin')
     * @return array
     */
    public function refreshToken($refreshToken, $accountType = null)
    {
        return parent::refreshToken($refreshToken, 'admin');
    }

    /**
     * Hook xử lý khi admin đăng nhập thành công
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @return void
     */
    protected function handleSuccessfulLogin($user, $ipAddress, $userAgent)
    {
        // Chỉ xử lý nếu người dùng là admin
        if ($user->account_type === 'admin') {
            $admin = Admin::where('user_id', $user->id)->first();

            if ($admin) {
                // Cập nhật thông tin đăng nhập trong bảng admins
                $admin->last_login_at = now();
                $admin->last_login_ip = $ipAddress;
                $admin->failed_login_attempts = 0; // Reset số lần đăng nhập thất bại
                $admin->account_locked_until = null; // Mở khóa tài khoản nếu đã bị khóa
                $admin->save();

                // Lưu lịch sử đăng nhập vào bảng admin_login_history
                AdminLoginHistory::create([
                    'admin_id' => $admin->id,
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'status' => 'success',
                    'login_at' => now()
                ]);

                Log::info('Admin login successful', [
                    'admin_id' => $admin->id,
                    'user_id' => $user->id,
                    'ip_address' => $ipAddress
                ]);
            }
        }
    }

    /**
     * Hook xử lý khi admin đăng nhập thất bại
     * 
     * @param string $identifier
     * @param string $accountType
     * @return void
     */
    protected function handleFailedLogin($identifier, $accountType)
    {
        // Chỉ xử lý nếu loại tài khoản là admin
        if ($accountType === 'admin') {
            // Tìm user dựa trên identifier
            $user = User::where(function ($query) use ($identifier) {
                $query->where('phone', $identifier)
                    ->orWhere('email', $identifier);
            })
                ->where('account_type', 'admin')
                ->first();

            if ($user) {
                $admin = Admin::where('user_id', $user->id)->first();

                if ($admin) {
                    // Tăng số lần đăng nhập thất bại
                    $admin->failed_login_attempts += 1;

                    // Khóa tài khoản nếu đăng nhập thất bại quá 5 lần
                    if ($admin->failed_login_attempts >= 5) {
                        $admin->account_locked_until = now()->addMinutes(30); // Khóa 30 phút
                        Log::warning('Admin account locked due to multiple failed login attempts', [
                            'admin_id' => $admin->id,
                            'user_id' => $user->id,
                            'locked_until' => $admin->account_locked_until->toDateTimeString()
                        ]);
                    }

                    $admin->save();

                    // Lưu lịch sử đăng nhập thất bại
                    AdminLoginHistory::create([
                        'admin_id' => $admin->id,
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'status' => 'failed',
                        'login_at' => now()
                    ]);

                    Log::warning('Admin login failed', [
                        'admin_id' => $admin->id,
                        'user_id' => $user->id,
                        'failed_attempts' => $admin->failed_login_attempts
                    ]);
                }
            }
        }
    }

    /**
     * Hook xử lý khi admin làm mới token thành công
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @param string|null $tokenId
     * @return void
     */
    protected function handleSuccessfulTokenRefresh($user, $ipAddress, $userAgent, $tokenId = null)
    {
        // Chỉ xử lý nếu người dùng là admin
        if ($user->account_type === 'admin') {
            $admin = Admin::where('user_id', $user->id)->first();

            if ($admin) {
                // Ghi hoạt động admin
                AdminActivity::create([
                    'admin_id' => $admin->id,
                    'action' => 'token_refresh',
                    'module' => 'authentication',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'context' => 'Admin refreshed authentication token',
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent
                ]);

                // Cập nhật thông tin đăng nhập trong bảng admins
                $admin->last_login_at = now(); // Cập nhật thời gian đăng nhập
                $admin->last_login_ip = $ipAddress;
                $admin->save();

                // Tìm bản ghi login history gần nhất
                $loginHistory = AdminLoginHistory::where('admin_id', $admin->id)
                    ->whereNull('logout_at')
                    ->orderBy('login_at', 'desc')
                    ->first();

                // Nếu không có phiên đăng nhập hiện tại, tạo một phiên mới
                if (!$loginHistory) {
                    AdminLoginHistory::create([
                        'admin_id' => $admin->id,
                        'ip_address' => $ipAddress,
                        'user_agent' => $userAgent,
                        'status' => 'success',
                        'login_at' => now(),
                        'logout_at' => null
                    ]);

                    Log::info('Admin token refresh - new session created', [
                        'admin_id' => $admin->id,
                        'user_id' => $user->id,
                        'token_id' => $tokenId
                    ]);
                } else {
                    // Cập nhật phiên hiện tại
                    $loginHistory->touch(); // Cập nhật updated_at

                    Log::info('Admin token refresh - existing session updated', [
                        'admin_id' => $admin->id,
                        'user_id' => $user->id,
                        'login_history_id' => $loginHistory->id,
                        'token_id' => $tokenId,
                        'session_duration' => now()->diffInMinutes($loginHistory->login_at) . ' minutes'
                    ]);
                }
            }
        }
    }

    /**
     * Cập nhật thông tin tài khoản admin
     * 
     * @param Request $request
     * @return array
     */
    public function updateAdminProfile(Request $request)
    {
        // Gọi phương thức chung từ lớp cha
        return $this->updateUser($request);
    }

    /**
     * Ghi đè phương thức hook để xử lý log cho admin
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
        // Chỉ xử lý log nếu người dùng là admin
        if ($user->account_type === 'admin' && $user->admin) {
            AdminActivity::create([
                'admin_id' => $user->admin->id,
                'action' => 'update',
                'module' => 'user_management',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'context' => 'Admin updated user information: ' . implode(', ', $changedFields),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            Log::info('Admin profile updated', [
                'admin_id' => $user->admin->id,
                'user_id' => $user->id,
                'changed_fields' => $changedFields
            ]);
        }
    }

    /**
     * Hook xử lý khi admin đăng xuất thành công
     * 
     * @param User $user
     * @param string $ipAddress
     * @param string $userAgent
     * @param string|null $tokenId
     * @return void
     */
    protected function handleSuccessfulLogout($user, $ipAddress, $userAgent, $tokenId = null)
    {
        // Chỉ xử lý nếu người dùng là admin
        if ($user->account_type === 'admin') {
            $admin = Admin::where('user_id', $user->id)->first();

            if ($admin) {
                // Tìm bản ghi login history gần nhất chưa có logout_at
                $loginHistory = AdminLoginHistory::where('admin_id', $admin->id)
                    ->whereNull('logout_at')
                    ->orderBy('login_at', 'desc')
                    ->first();

                if ($loginHistory) {
                    // Cập nhật thời gian đăng xuất
                    $loginHistory->logout_at = now();
                    $loginHistory->save();

                    Log::info('Admin logout recorded', [
                        'admin_id' => $admin->id,
                        'user_id' => $user->id,
                        'login_history_id' => $loginHistory->id,
                        'session_duration' => now()->diffInMinutes($loginHistory->login_at) . ' minutes'
                    ]);
                } else {
                    // Nếu không tìm thấy bản ghi login, tạo một bản ghi mới chỉ với thông tin logout
                    AdminLoginHistory::create([
                        'admin_id' => $admin->id,
                        'ip_address' => $ipAddress,
                        'user_agent' => $userAgent,
                        'status' => 'success',
                        'login_at' => now()->subMinutes(1), // Giả định đăng nhập 1 phút trước
                        'logout_at' => now()
                    ]);

                    Log::info('Admin logout recorded (no matching login record)', [
                        'admin_id' => $admin->id,
                        'user_id' => $user->id
                    ]);
                }

                // Ghi hoạt động admin
                AdminActivity::create([
                    'admin_id' => $admin->id,
                    'action' => 'logout',
                    'module' => 'authentication',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'context' => 'Admin logged out of the system',
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent
                ]);
            }
        }
    }
}
