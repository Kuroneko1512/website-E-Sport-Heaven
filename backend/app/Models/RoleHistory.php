<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleHistory extends Model
{
    use HasFactory;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'admin_id',         // ID admin được thay đổi role
        'changed_by',       // ID admin thực hiện thay đổi
        'old_roles',        // Vai trò cũ
        'new_roles',        // Vai trò mới
        'reason'            // Lý do thay đổi
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'old_roles' => 'json',
        'new_roles' => 'json'
    ];

    // Quan hệ với bảng admins (admin được thay đổi role)
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    // Quan hệ với bảng admins (admin thực hiện thay đổi)
    public function changedBy()
    {
        return $this->belongsTo(Admin::class, 'changed_by');
    }
}
