<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Admin;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_active',
        'account_type',
        'avatar',
        'avatar_public_id',
        'provider',
        'provider_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'account_type' => 'string'
    ];

    // Quan hệ 1-1 với bảng Admin
    public function admin()
    {
        return $this->hasOne(Admin::class);
    }

    // Quan hệ 1-1 với bảng Customer
    public function customer()
    {
        return $this->hasOne(Customer::class);
    }
    // Phương thức helper để lấy guard phù hợp
    public function getGuardNameAttribute()
    {
        return $this->account_type; // 'admin' hoặc 'customer'
    }

    /**
     *
     * @param string $username
     * @return User|null
     * Cái này cần thiết vì nếu không dùng email để đăng nhập
     * Ta cần function này trả về Customer và có thể lựa chọn thêm các trường để đăng nhập như email, phone, username, ...
     */
    public function findForPassport(string $username): ?User
    {
        return $this->where('email', $username)
            // ->orWhere('username', $username)
            ->orWhere('phone', $username)
            ->first();
    }
}
