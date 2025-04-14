<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory, SoftDeletes;
    // Các trạng thái đơn hàng
    const STATUS_PROCESSING = 0;      // đang xử lý
    const STATUS_CONFIRMED = 1;       // đã xác nhận
    const STATUS_SHIPPING = 2;        // đang giao
    const STATUS_COMPLETED = 3;       // hoàn thành
    const STATUS_CANCELLED = 4;       // đã hủy

    // Các trạng thái thanh toán
    const PAYMENT_STATUS_UNPAID = 0;  // chưa thanh toán
    const PAYMENT_STATUS_PAID = 1;    // đã thanh toán

    // Các loại giảm giá
    const DISCOUNT_TYPE_PERCENTAGE = 0; // Giảm giá theo phần trăm
    const DISCOUNT_TYPE_FIXED = 1;      // Giảm giá cố định
    const DISCOUNT_TYPE_FREE = 2;       // Miễn phí (cho vận chuyển)

    // Các trạng thái hoàn hàng
    const RETURN_STATUS_NONE = 0;              // Không có yêu cầu hoàn hàng
    const RETURN_STATUS_REQUESTED = 1;         // Đã yêu cầu hoàn hàng
    const RETURN_STATUS_PARTIALLY_RETURNED = 2; // Hoàn hàng một phần
    const RETURN_STATUS_FULLY_RETURNED = 3;    // Hoàn hàng toàn bộ
    const RETURN_STATUS_PARTIALLY_REFUNDED = 4; // Hoàn tiền một phần
    const RETURN_STATUS_FULLY_REFUNDED = 5;    // Hoàn tiền toàn bộ
    const RETURN_STATUS_EXCHANGED = 6;         // Đã đổi hàng

    // Nhãn hiển thị cho các trạng thái
    public static $statusLabels = [
        self::STATUS_PROCESSING => 'Đang xử lý',
        self::STATUS_CONFIRMED => 'Đã xác nhận',
        self::STATUS_SHIPPING => 'Đang giao',
        self::STATUS_COMPLETED => 'Hoàn thành',
        self::STATUS_CANCELLED => 'Đã hủy'
    ];

    public static $paymentStatusLabels = [
        self::PAYMENT_STATUS_UNPAID => 'Chưa thanh toán',
        self::PAYMENT_STATUS_PAID => 'Đã thanh toán'
    ];

    public static $discountTypeLabels = [
        self::DISCOUNT_TYPE_PERCENTAGE => 'Phần trăm',
        self::DISCOUNT_TYPE_FIXED => 'Cố định',
        self::DISCOUNT_TYPE_FREE => 'Miễn phí'
    ];

    public static $returnStatusLabels = [
        self::RETURN_STATUS_NONE => 'Không có yêu cầu hoàn hàng',
        self::RETURN_STATUS_REQUESTED => 'Đã yêu cầu hoàn hàng',
        self::RETURN_STATUS_PARTIALLY_RETURNED => 'Hoàn hàng một phần',
        self::RETURN_STATUS_FULLY_RETURNED => 'Hoàn hàng toàn bộ',
        self::RETURN_STATUS_PARTIALLY_REFUNDED => 'Hoàn tiền một phần',
        self::RETURN_STATUS_FULLY_REFUNDED => 'Hoàn tiền toàn bộ',
        self::RETURN_STATUS_EXCHANGED => 'Đã đổi hàng'
    ];

    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'customer_note',
        'admin_note',
        'order_code',
        'total_amount',
        'subtotal',
        'tax_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_transaction_id',
        'paid_at',
        'shipping_method',
        'shipping_fee',
        'tracking_number',
        'order_coupon_code',
        'order_coupon_name',
        'order_discount_type',
        'order_discount_value',
        'order_discount_amount',
        'shipping_coupon_code',
        'shipping_coupon_name',
        'shipping_discount_type',
        'shipping_discount_value',
        'shipping_discount_amount',
        'has_return_request',
        'return_status',
        'refunded_amount'
    ];

    // Accessor để lấy nhãn trạng thái
    public function getStatusLabelAttribute()
    {
        return self::$statusLabels[$this->status] ?? 'Unknown';
    }

    public function getPaymentStatusLabelAttribute()
    {
        return self::$paymentStatusLabels[$this->payment_status] ?? 'Unknown';
    }

    public function getReturnStatusLabelAttribute()
    {
        return self::$returnStatusLabels[$this->return_status] ?? 'Unknown';
    }

    /**
     * Quan hệ với bảng order_items (Một đơn hàng có nhiều sản phẩm)
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Quan hệ với bảng customer (Một đơn hàng có thể thuộc về một khách hàng)
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Quan hệ với bảng order_histories (Một đơn hàng có nhiều lịch sử)
     */
    public function histories()
    {
        return $this->hasMany(OrderHistory::class);
    }

    /**
     * Quan hệ với bảng order_returns (Một đơn hàng có thể có nhiều yêu cầu hoàn hàng)
     */
    public function returns()
    {
        return $this->hasMany(OrderReturn::class);
    }
}
