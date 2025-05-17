<?php

namespace App\Models;

use App\Models\OrderReturnItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderReturn extends Model
{
    use HasFactory, SoftDeletes;

    // Các loại hoàn hàng
    const RETURN_TYPE_RETURN = 0;     // Hoàn hàng (trả lại hàng)
    const RETURN_TYPE_EXCHANGE = 1;   // Đổi hàng
    const RETURN_TYPE_REFUND = 2;     // Hoàn tiền (không cần trả hàng)

    // Các loại lý do hoàn hàng
    const REASON_TYPE_WRONG_ITEM = 0;     // Sản phẩm không đúng
    const REASON_TYPE_DEFECTIVE = 1;      // Sản phẩm lỗi
    const REASON_TYPE_NOT_AS_DESCRIBED = 2; // Không đúng mô tả
    const REASON_TYPE_ARRIVED_LATE = 3;   // Giao hàng trễ
    const REASON_TYPE_DAMAGED = 4;        // Sản phẩm bị hư hỏng
    const REASON_TYPE_CHANGED_MIND = 5;   // Đổi ý
    const REASON_TYPE_OTHER = 6;          // Lý do khác

    // Các trạng thái hoàn hàng
    const STATUS_PENDING = 0;         // Chờ xử lý
    const STATUS_APPROVED = 1;        // Đã duyệt
    const STATUS_PROCESSING = 2;      // Đang xử lý
    const STATUS_COMPLETED = 3;       // Hoàn thành
    const STATUS_REJECTED = 4;        // Từ chối

    // Nhãn hiển thị cho các loại
    public static $returnTypeLabels = [
        self::RETURN_TYPE_RETURN => 'Hoàn hàng',
        self::RETURN_TYPE_EXCHANGE => 'Đổi hàng',
        self::RETURN_TYPE_REFUND => 'Hoàn tiền'
    ];

    public static $reasonTypeLabels = [
        self::REASON_TYPE_WRONG_ITEM => 'Sản phẩm không đúng',
        self::REASON_TYPE_DEFECTIVE => 'Sản phẩm lỗi',
        self::REASON_TYPE_NOT_AS_DESCRIBED => 'Không đúng mô tả',
        self::REASON_TYPE_ARRIVED_LATE => 'Giao hàng trễ',
        self::REASON_TYPE_DAMAGED => 'Sản phẩm bị hư hỏng',
        self::REASON_TYPE_CHANGED_MIND => 'Đổi ý',
        self::REASON_TYPE_OTHER => 'Lý do khác'
    ];

    public static $statusLabels = [
        self::STATUS_PENDING => 'Chờ xử lý',
        self::STATUS_APPROVED => 'Đã duyệt',
        self::STATUS_PROCESSING => 'Đang xử lý',
        self::STATUS_COMPLETED => 'Hoàn thành',
        self::STATUS_REJECTED => 'Từ chối'
    ];

    protected $fillable = [
        'order_id',
        'return_code',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'processed_by',
        'processor_name',
        'return_type',
        'return_reason_type',
        'return_reason',
        'customer_note',
        'admin_note',
        'status',
        'requested_at',
        'processed_at',
        'completed_at',
        'total_return_amount',
        'refund_amount',
        'restocking_fee',
        'refund_method',
        'refund_transaction_id',
        'return_address',
        'shipping_carrier',
        'tracking_number',
        'shipping_fee'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Accessor để lấy nhãn loại
    public function getReturnTypeLabelAttribute()
    {
        return self::$returnTypeLabels[$this->return_type] ?? 'Unknown';
    }

    public function getReasonTypeLabelAttribute()
    {
        return self::$reasonTypeLabels[$this->return_reason_type] ?? 'Unknown';
    }

    public function getStatusLabelAttribute()
    {
        return self::$statusLabels[$this->status] ?? 'Unknown';
    }

    /**
     * Quan hệ với bảng orders
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Quan hệ với bảng customers (không ràng buộc)
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id')->withDefault([
            'first_name' => $this->customer_name,
            'email' => $this->customer_email
        ]);
    }

    /**
     * Quan hệ với bảng admins (không ràng buộc)
     */
    public function processor()
    {
        return $this->belongsTo(Admin::class, 'processed_by')->withDefault([
            'first_name' => $this->processor_name
        ]);
    }

    /**
     * Quan hệ với bảng order_return_items
     */
    public function returnItems()
    {
        return $this->hasMany(OrderReturnItem::class);
    }

    /**
     * Tạo mã hoàn hàng
     * 
     * @return string
     */
    public static function generateReturnCode()
    {
        $prefix = 'RTN';
        $timestamp = now()->format('ymdHi');
        $random = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 3));

        return $prefix . $timestamp . $random;
    }
}
