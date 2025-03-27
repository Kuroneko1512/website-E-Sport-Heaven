<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminLoginHistory extends Model
{
    use HasFactory;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'admin_id',         // ID admin đăng nhập
        'ip_address',       // Địa chỉ IP
        'user_agent',       // Thông tin trình duyệt
        'status',           // Trạng thái đăng nhập
        'login_at',         // Thời điểm đăng nhập
        'logout_at'         // Thời điểm đăng xuất
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'status' => 'string',
        'login_at' => 'datetime',
        'logout_at' => 'datetime'
    ];

    // Quan hệ với bảng admins
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
