<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleHistory extends Model
{
    /**
     * Các trường có thể gán giá trị hàng loạt
     */
    protected $fillable = [
        'admin_id',
        'changed_by',
        'old_roles',
        'new_roles',
        'reason'
    ];

    /**
     * Các trường cần cast kiểu dữ liệu
     */
    protected $casts = [
        'old_roles' => 'json',
        'new_roles' => 'json'
    ];

    /**
     * Quan hệ với admin được thay đổi role
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * Quan hệ với admin thực hiện thay đổi
     */
    public function changedBy()
    {
        return $this->belongsTo(Admin::class, 'changed_by');
    }
}
