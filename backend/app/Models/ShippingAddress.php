<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingAddress extends Model
{
    use HasFactory, SoftDeletes;

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'customer_id',      // ID khách hàng
        'recipient_name',   // Tên người nhận
        'phone',            // Số điện thoại
        'email',            // Email người nhận
        'address_line1',    // Địa chỉ chi tiết dòng 1
        'address_line2',    // Địa chỉ chi tiết dòng 2
        'province_code',    // Mã tỉnh/thành phố
        'district_code',    // Mã quận/huyện
        'commune_code',     // Mã xã/phường
        'postal_code',      // Mã bưu điện
        'country',          // Quốc gia
        'is_default',       // Địa chỉ mặc định
        'notes'             // Ghi chú
    ];

    // Các kiểu dữ liệu cho từng trường
    protected $casts = [
        'is_default' => 'boolean'
    ];

    // Quan hệ với bảng customers
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Quan hệ với bảng provinces
    public function province()
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }

    // Quan hệ với bảng districts
    public function district()
    {
        return $this->belongsTo(District::class, 'district_code', 'code');
    }

    // Quan hệ với bảng communes
    public function commune()
    {
        return $this->belongsTo(Commune::class, 'commune_code', 'code');
    }
}
