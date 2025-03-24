<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Province extends Model
{
    use HasFactory, SoftDeletes;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'code',             // Mã tỉnh/thành phố
        'name',             // Tên tiếng Việt
        'name_en',          // Tên tiếng Anh
        'type'              // Loại (tỉnh/thành phố)
    ];

    // Quan hệ với bảng districts
    public function districts()
    {
        return $this->hasMany(District::class, 'province_code', 'code');
    }

    // Quan hệ với bảng shipping_addresses
    public function shippingAddresses()
    {
        return $this->hasMany(ShippingAddress::class, 'province_code', 'code');
    }

    // Quan hệ với bảng communes thông qua bảng districts
    public function communes()
    {
        return $this->hasManyThrough(
            Commune::class,
            District::class,
            'province_code',    // FK trên districts tham chiếu tới provinces
            'district_code',    // FK trên communes tham chiếu tới districts  
            'code',            // PK của provinces
            'code'             // PK của districts
        );
    }
}
