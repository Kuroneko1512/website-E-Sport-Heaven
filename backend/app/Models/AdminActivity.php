<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActivity extends Model
{
    /**
     * Các trường có thể gán giá trị hàng loạt
     */
    protected $fillable = [
        'admin_id',
        'action',
        'module',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent'
    ];

    /**
     * Các trường cần cast kiểu dữ liệu
     */
    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json'
    ];

    /**
     * Quan hệ với model Admin
     * Lấy thông tin admin thực hiện hành động
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * Quan hệ đa hình với entity được thao tác
     * VD: Product, Order, Role,...
     */
    public function entity()
    {
        return $this->morphTo();
    }
}
