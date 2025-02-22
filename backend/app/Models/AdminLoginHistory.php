<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminLoginHistory extends Model
{
    /**
     * Không sử dụng timestamps mặc định
     * Chỉ dùng login_at để track thời gian
     * Lý do không dùng timestamps trong AdminLoginHistory:
     *1.Bảng này chỉ cần theo dõi chính xác thời điểm đăng nhập:
     *  login_at: thời điểm admin thực hiện đăng nhập
     *  Không cần created_at vì trùng với login_at
     *  Không cần updated_at vì log không được phép sửa
     *2.Tối ưu performance:
     *  Giảm 2 trường không cần thiết
     *  Giảm queries khi insert
     *  Tiết kiệm storage
     *3.Đúng với bản chất của logging:
     *  Log là immutable (không thay đổi)
     *  Chỉ cần thời điểm xảy ra sự kiện
     *  Dữ liệu chỉ được thêm mới, không update
     */
    public $timestamps = false;

    /**
     * Các trường có thể gán giá trị hàng loạt
     */
    protected $fillable = [
        'admin_id',
        'ip_address',
        'user_agent',
        'status',
        'login_at'
    ];

    /**
     * Các trường cần cast kiểu dữ liệu
     */
    protected $casts = [
        'login_at' => 'datetime'
    ];

    /**
     * Quan hệ với model Admin
     * Lấy thông tin admin đăng nhập
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
