<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admin extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'position',
        'department',
        'status',
        'failed_login_attempts',
        'account_locked_until',
        'last_login_at',
        'last_login_ip',
        'created_by',
        'updated_by'
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'status' => 'string',
        'failed_login_attempts' => 'integer',
        'account_locked_until' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    // Quan hệ với bảng users 1-1
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với bảng admin_activities 1-n
    public function activities()
    {
        return $this->hasMany(AdminActivity::class);
    }

    // Quan hệ với bảng admin_login_history 1-n
    public function loginHistory()
    {
        return $this->hasMany(AdminLoginHistory::class);
    }

    // Quan hệ với bảng role_history 1-n
    public function roleHistory()
    {
        return $this->hasMany(RoleHistory::class);
    }
}
