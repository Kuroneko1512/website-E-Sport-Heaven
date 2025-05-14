<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Order extends Model
{
    use HasFactory, SoftDeletes;
    // Các trạng thái chính của đơn hàng
    const STATUS_PENDING = 0;              // Đang xử lý (mới đặt hàng)
    const STATUS_CONFIRMED = 1;            // Đã xác nhận
    const STATUS_PREPARING = 2;            // Đang chuẩn bị hàng
    const STATUS_READY_TO_SHIP = 3;        // Sẵn sàng giao hàng
    const STATUS_SHIPPING = 4;             // Đang giao hàng
    const STATUS_DELIVERED = 5;            // Đã giao hàng
    const STATUS_COMPLETED = 6;            // Hoàn thành
    const STATUS_RETURN_REQUESTED = 7;     // Đã yêu cầu đổi/trả
    const STATUS_RETURN_PROCESSING = 8;    // Đang xử lý đổi/trả
    const STATUS_RETURN_COMPLETED = 9;     // Đã hoàn thành đổi/trả
    const STATUS_CANCELLED = 10;           // Đã hủy
    const STATUS_RETURN_TO_SHOP = 11;      // Hoàn về cửa hàng (sau 3 lần giao thất bại)
    const STATUS_IN_STORE_ACTIVE = 12;      // Đơn tại cửa hàng (trong thời gian đổi trả)
    const STATUS_IN_STORE_COMPLETED = 13;   // Đơn tại cửa hàng (hết thời gian đổi trả)
    const STATUS_RETURN_REJECTED = 14;  // Đã từ chối yêu cầu đổi/trả

    // Các trạng thái vận chuyển
    const SHIPPING_STATUS_SHIPPING = 0;            // Đang giao hàng
    const SHIPPING_STATUS_DELIVERED = 1;           // Đã giao hàng thành công
    const SHIPPING_STATUS_DELIVERY_FAILED = 2;     // Giao hàng thất bại
    const SHIPPING_STATUS_DELIVERY_RESCHEDULED = 3; // Đã hẹn lại thời gian giao
    const SHIPPING_STATUS_RETURNING = 4;           // Đang hoàn về cửa hàng
    const SHIPPING_STATUS_RETURNED = 5;            // Đã hoàn về cửa hàng

    // Các trạng thái thanh toán
    const PAYMENT_STATUS_UNPAID = 0;               // Chưa thanh toán
    const PAYMENT_STATUS_PAID = 1;                 // Đã thanh toán
    const PAYMENT_STATUS_PARTIALLY_REFUNDED = 2;   // Hoàn tiền một phần
    const PAYMENT_STATUS_FULLY_REFUNDED = 3;       // Hoàn tiền toàn bộ
    const PAYMENT_STATUS_FAILED = 4;               // Thanh toán thất bại
    const PAYMENT_STATUS_EXPIRED = 5;              // Thanh toán hết hạn

    // Các loại giảm giá
    const DISCOUNT_TYPE_PERCENTAGE = 0;            // Giảm giá theo phần trăm
    const DISCOUNT_TYPE_FIXED = 1;                 // Giảm giá cố định
    const DISCOUNT_TYPE_FREE = 2;                  // Miễn phí (cho vận chuyển)

    // Các trạng thái đổi/trả hàng
    const RETURN_STATUS_PENDING = 0;               // Chờ xử lý
    const RETURN_STATUS_APPROVED = 1;              // Đã duyệt
    const RETURN_STATUS_PROCESSING = 2;            // Đang xử lý
    const RETURN_STATUS_COMPLETED = 3;             // Hoàn thành
    const RETURN_STATUS_REJECTED = 4;              // Từ chối

    // Nhãn hiển thị cho các trạng thái đơn hàng
    public static $statusLabels = [
        self::STATUS_PENDING => 'Đang xử lý',
        self::STATUS_CONFIRMED => 'Đã xác nhận',
        self::STATUS_PREPARING => 'Đang chuẩn bị hàng',
        self::STATUS_READY_TO_SHIP => 'Sẵn sàng giao hàng',
        self::STATUS_SHIPPING => 'Đang giao hàng',
        self::STATUS_DELIVERED => 'Đã giao hàng',
        self::STATUS_COMPLETED => 'Hoàn thành',
        self::STATUS_RETURN_REQUESTED => 'Đã yêu cầu đổi/trả',
        self::STATUS_RETURN_PROCESSING => 'Đang xử lý đổi/trả',
        self::STATUS_RETURN_COMPLETED => 'Đã hoàn thành đổi/trả',
        self::STATUS_CANCELLED => 'Đã hủy',
        self::STATUS_RETURN_TO_SHOP => 'Hoàn về cửa hàng',
        self::STATUS_IN_STORE_ACTIVE => 'Đơn tại cửa hàng (đang trong thời gian đổi trả)',
        self::STATUS_IN_STORE_COMPLETED => 'Đơn tại cửa hàng (hết thời gian đổi trả)',
        self::STATUS_RETURN_REJECTED => 'Đã trên chối yêu cầu đổi/trả',
    ];

    // Nhãn hiển thị cho các trạng thái vận chuyển
    public static $shippingStatusLabels = [
        self::SHIPPING_STATUS_SHIPPING => 'Đang giao hàng',
        self::SHIPPING_STATUS_DELIVERED => 'Đã giao hàng thành công',
        self::SHIPPING_STATUS_DELIVERY_FAILED => 'Giao hàng thất bại',
        self::SHIPPING_STATUS_DELIVERY_RESCHEDULED => 'Đã hẹn lại thời gian giao',
        self::SHIPPING_STATUS_RETURNING => 'Đang hoàn về cửa hàng',
        self::SHIPPING_STATUS_RETURNED => 'Đã hoàn về cửa hàng'
    ];

    // Nhãn hiển thị cho các trạng thái thanh toán
    public static $paymentStatusLabels = [
        self::PAYMENT_STATUS_UNPAID => 'Chưa thanh toán',
        self::PAYMENT_STATUS_PAID => 'Đã thanh toán',
        self::PAYMENT_STATUS_PARTIALLY_REFUNDED => 'Hoàn tiền một phần',
        self::PAYMENT_STATUS_FULLY_REFUNDED => 'Hoàn tiền toàn bộ',
        self::PAYMENT_STATUS_FAILED => 'Thanh toán thất bại',
        self::PAYMENT_STATUS_EXPIRED => 'Thanh toán hết hạn'
    ];

    // Nhãn hiển thị cho các loại giảm giá
    public static $discountTypeLabels = [
        self::DISCOUNT_TYPE_PERCENTAGE => 'Phần trăm',
        self::DISCOUNT_TYPE_FIXED => 'Cố định',
        self::DISCOUNT_TYPE_FREE => 'Miễn phí'
    ];

    // Nhãn hiển thị cho các trạng thái đổi/trả hàng
    public static $returnStatusLabels = [
        self::RETURN_STATUS_PENDING => 'Chờ xử lý',
        self::RETURN_STATUS_APPROVED => 'Đã duyệt',
        self::RETURN_STATUS_PROCESSING => 'Đang xử lý',
        self::RETURN_STATUS_COMPLETED => 'Hoàn thành',
        self::RETURN_STATUS_REJECTED => 'Từ chối'
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
        'shipping_status',
        'shipped_at',
        'delivered_at',
        'delivery_attempts',
        'delivery_notes',
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
        'is_store_pickup',
        'has_return_request',
        'return_status',
        'refunded_amount',
        'confirmed_at',
        'cancelled_at',
        'cancel_reason',
        'cancelled_by',
        'completed_at'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'order_discount_value' => 'decimal:2',
        'order_discount_amount' => 'decimal:2',
        'shipping_discount_value' => 'decimal:2',
        'shipping_discount_amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'is_store_pickup' => 'boolean',
        'has_return_request' => 'boolean',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Accessor để lấy nhãn trạng thái đơn hàng
    public function getStatusLabelAttribute()
    {
        return self::$statusLabels[$this->status] ?? 'Unknown';
    }

    // Accessor để lấy nhãn trạng thái vận chuyển
    public function getShippingStatusLabelAttribute()
    {
        return self::$shippingStatusLabels[$this->shipping_status] ?? 'Unknown';
    }

    // Accessor để lấy nhãn trạng thái thanh toán
    public function getPaymentStatusLabelAttribute()
    {
        return self::$paymentStatusLabels[$this->payment_status] ?? 'Unknown';
    }

    // Accessor để lấy nhãn trạng thái đổi/trả hàng
    public function getReturnStatusLabelAttribute()
    {
        return self::$returnStatusLabels[$this->return_status] ?? 'Unknown';
    }

    // Accessor để lấy nhãn loại giảm giá đơn hàng
    public function getOrderDiscountTypeLabelAttribute()
    {
        return self::$discountTypeLabels[$this->order_discount_type] ?? 'Unknown';
    }

    // Accessor để lấy nhãn loại giảm giá vận chuyển
    public function getShippingDiscountTypeLabelAttribute()
    {
        return self::$discountTypeLabels[$this->shipping_discount_type] ?? 'Unknown';
    }


    /**
     * Kiểm tra xem đơn hàng có thể hủy không
     * 
     * @return bool
     */
    public function canCancel()
    {
        // Chỉ có thể hủy đơn hàng ở các trạng thái ban đầu
        $cancellableStatuses = [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
            self::STATUS_PREPARING
        ];

        return in_array($this->status, $cancellableStatuses);
    }

    /**
     * Quan hệ với bảng admins (Người hủy đơn hàng)
     */
    public function cancelledByAdmin()
    {
        return $this->belongsTo(Admin::class, 'cancelled_by');
    }

    /**
     * Quan hệ với bảng warehouse_transactions (Các giao dịch kho liên quan)
     */
    public function warehouseTransactions()
    {
        return $this->hasMany(WarehouseTransaction::class, 'reference_code', 'order_code')
            ->where('reference_type', WarehouseTransaction::REF_TYPE_ORDER);
    }

    /**
     * Tính tổng số lượng sản phẩm trong đơn hàng
     * 
     * @return int
     */
    public function getTotalQuantityAttribute()
    {
        return $this->orderItems->sum('quantity');
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
       public function userReturns()
    {
        return $this->hasMany(OrderUserReturn::class);
    }
}
