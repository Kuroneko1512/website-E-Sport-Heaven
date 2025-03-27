<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActivity extends Model
{
    use HasFactory;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'admin_id',         // ID admin thực hiện
        'action',           // Hành động thực hiện
        'module',           // Module tác động
        'entity_type',      // Loại đối tượng
        'entity_id',        // ID đối tượng
        'old_values',       // Giá trị cũ
        'new_values',       // Giá trị mới
        'context',          // Bối cảnh hành động
        'ip_address',       // Địa chỉ IP
        'user_agent'        // Thông tin trình duyệt
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json'
    ];

    // Quan hệ với bảng admins
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
