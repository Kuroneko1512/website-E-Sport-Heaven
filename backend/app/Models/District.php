<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class District extends Model
{
    use HasFactory, SoftDeletes;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'code',             // Mã quận/huyện
        'province_code',    // Mã tỉnh/thành phố
        'name',             // Tên tiếng Việt
        'name_en',          // Tên tiếng Anh
        'type'              // Loại (quận/huyện)
    ];

    // get name
    public function getDistrictName($code)
    {
        return District::where('code', $code)->first()->name;
    }

    // Quan hệ với bảng provinces
    public function province()
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }

    // Quan hệ với bảng communes
    public function communes()
    {
        return $this->hasMany(Commune::class, 'district_code', 'code');
    }

    // Quan hệ với bảng shipping_addresses
    public function shippingAddresses()
    {
        return $this->hasMany(ShippingAddress::class, 'district_code', 'code');
    }
}
