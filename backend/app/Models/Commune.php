<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commune extends Model
{
    use HasFactory, SoftDeletes;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'code',             // Mã xã/phường
        'district_code',    // Mã quận/huyện
        'name',             // Tên tiếng Việt
        'name_en',          // Tên tiếng Anh
        'type'              // Loại (xã/phường)
    ];

    // Get name
    public function getCommuneName($code)
    {
        return Commune::where('code', $code)->first()->name;
    }

    // Quan hệ với bảng districts
    public function district()
    {
        return $this->belongsTo(District::class, 'district_code', 'code');
    }

    // Quan hệ với bảng shipping_addresses
    public function shippingAddresses()
    {
        return $this->hasMany(ShippingAddress::class, 'commune_code', 'code');
    }
}
