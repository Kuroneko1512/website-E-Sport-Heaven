<?php

namespace App\Models;

use App\Models\Order;
use Illuminate\Database\Eloquent\Model;

class OrderUserReturn extends Model
{
    protected $table = 'orders_user_return';


    // Các trạng thái của yêu cầu đổi/trả
    const STATUS_PENDING = 0;              // Chờ xử lý
    const STATUS_APPROVED = 1;             // Đã duyệt
    const STATUS_PROCESSING = 2;           // Đang xử lý
    const STATUS_COMPLETED = 3;            // Hoàn thành
    const STATUS_REJECTED = 4;             // Từ chối

    // Nhãn hiển thị cho các trạng thái đổi/trả
    public static $statusLabels = [
        self::STATUS_PENDING => 'Chờ xử lý',
        self::STATUS_APPROVED => 'Đã duyệt',
        self::STATUS_PROCESSING => 'Đang xử lý',
        self::STATUS_COMPLETED => 'Hoàn thành',
        self::STATUS_REJECTED => 'Từ chối',
    ];

    // Các lý do trả lại sản phẩm
    const REASON_PRODUCT_DEFECT = 0;      // Lỗi sản phẩm
    const REASON_WRONG_ITEM = 1;          // Sản phẩm sai
    const REASON_CUSTOMER_CHANGE_MIND = 2; // Khách hàng thay đổi ý định
    const REASON_LATE_DELIVERY = 3;       // Giao hàng trễ
    const REASON_OTHER = 4;               // Lý do khác

    // Nhãn hiển thị cho các lý do trả lại
    public static $reasonLabels = [
        self::REASON_PRODUCT_DEFECT => 'Lỗi sản phẩm',
        self::REASON_WRONG_ITEM => 'Sản phẩm sai',
        self::REASON_CUSTOMER_CHANGE_MIND => 'Khách hàng thay đổi ý định',
        self::REASON_LATE_DELIVERY => 'Giao hàng trễ',
        self::REASON_OTHER => 'Lý do khác',
    ];
    protected $fillable = [
        'order_id',
        'order_item_id',
        'reason',
        'description',
        'image',
        'refund_bank_account',
        'refund_bank_name',
        'refund_amount',
        'refunded_at',
        'status',
        'refund_bank_customer_name'
    ];
    // Phương thức để ánh xạ status
    public function getStatusLabelAttribute()
    {
        return self::$statusLabels[$this->status] ?? 'Chưa xác định';
    }

    // Phương thức để ánh xạ reason
    public function getReasonLabelAttribute()
    {
        return self::$reasonLabels[$this->reason] ?? 'Không xác định';
    }
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function images()
    {
        return $this->hasMany(OrdersUserReturnImage::class, 'return_id');
    }
}
