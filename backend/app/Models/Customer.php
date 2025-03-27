<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'user_id',                  // ID người dùng liên kết
        'first_name',               // Tên
        'last_name',                // Họ
        'gender',                   // Giới tính
        'birthdate',                // Ngày sinh
        'bio',                      // Tiểu sử
        'loyalty_points',           // Điểm thưởng
        'customer_rank',            // Hạng khách hàng
        'preferred_contact_method', // Phương thức liên hệ ưu tiên
        'last_login_at',            // Lần đăng nhập cuối
        'rank_updated_at',          // Thời điểm cập nhật hạng
        'preferences'               // Tùy chọn cá nhân
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'gender' => 'string',
        'birthdate' => 'date',
        'loyalty_points' => 'integer',
        'customer_rank' => 'string',
        'last_login_at' => 'datetime',
        'rank_updated_at' => 'datetime',
        'preferences' => 'json'
    ];

    // Quan hệ với bảng users
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với bảng shipping_addresses
    public function shippingAddresses()
    {
        return $this->hasMany(ShippingAddress::class);
    }
}
