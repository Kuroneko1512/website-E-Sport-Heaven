<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasFactory, HasApiTokens, HasRoles, Notifiable, SoftDeletes;

    /**
     * Guard name cho Spatie Permission Package
     * Định nghĩa guard sẽ được sử dụng để check permissions
     * Phải khớp với guard trong config/auth.php
     */
    protected $guard_name = 'admin';

    /**
     * Các trường có thể gán giá trị hàng loạt
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'position',
        'department',
        'status'
    ];

    /**
     * Các trường ẩn khi serialize model
     */
    protected $hidden = [
        'password'
    ];

    /**
     * Các trường cần cast kiểu dữ liệu
     */
    protected $casts = [
        'last_login_at' => 'datetime'
    ];

    /**
     * Quan hệ với bảng admin_activities
     * Lấy lịch sử hoạt động của admin
     */
    public function activities()
    {
        return $this->hasMany(AdminActivity::class);
    }

    /**
     * Quan hệ với bảng admin_login_history
     * Lấy lịch sử đăng nhập của admin
     */
    public function loginHistory()
    {
        return $this->hasMany(AdminLoginHistory::class);
    }

    /**
     * Quan hệ với bảng role_history
     * Lấy lịch sử thay đổi roles của admin
     */
    public function roleHistory()
    {
        return $this->hasMany(RoleHistory::class);
    }
}
