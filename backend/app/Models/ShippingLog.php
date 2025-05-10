<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingLog extends Model
{
    use HasFactory;

    /**
     * Các trạng thái vận chuyển
     */
    const STATUS_SHIPPING = 0;             // Đang giao hàng
    const STATUS_DELIVERED = 1;            // Đã giao hàng thành công
    const STATUS_DELIVERY_FAILED = 2;      // Giao hàng thất bại
    const STATUS_DELIVERY_RESCHEDULED = 3; // Đã hẹn lại thời gian giao
    const STATUS_RETURNING = 4;            // Đang hoàn về cửa hàng
    const STATUS_RETURNED = 5;             // Đã hoàn về cửa hàng

    /**
     * Ánh xạ trạng thái vận chuyển sang tên hiển thị
     */
    public static $statusLabels = [
        self::STATUS_SHIPPING => 'Đang giao hàng',
        self::STATUS_DELIVERED => 'Đã giao hàng thành công',
        self::STATUS_DELIVERY_FAILED => 'Giao hàng thất bại',
        self::STATUS_DELIVERY_RESCHEDULED => 'Đã hẹn lại thời gian giao',
        self::STATUS_RETURNING => 'Đang hoàn về cửa hàng',
        self::STATUS_RETURNED => 'Đã hoàn về cửa hàng',
    ];

    /**
     * Các trường có thể gán giá trị hàng loạt
     *
     * @var array
     */
    protected $fillable = [
        'order_id',
        'tracking_number',
        'carrier',
        'event_code',
        'event_name',
        'event_description',
        'event_time',
        'location',
        'location_code',
        'handler_name',
        'handler_phone',
        'notes',
        'raw_data'
    ];

    /**
     * Các trường được ép kiểu
     *
     * @var array
     */
    protected $casts = [
        'event_time' => 'datetime',
        'raw_data' => 'array',
    ];

    /**
     * Lấy tên hiển thị của trạng thái vận chuyển
     *
     * @return string
     */
    public function getStatusLabelAttribute()
    {
        // Kiểm tra xem event_code có phải là số không
        if (is_numeric($this->event_code)) {
            $eventCode = (int)$this->event_code;
            return self::$statusLabels[$eventCode] ?? $this->event_name ?? 'Không xác định';
        }

        // Nếu không phải số, trả về event_name hoặc event_code
        return $this->event_name ?? $this->event_code ?? 'Không xác định';
    }

    /**
     * Quan hệ với bảng orders
     * Một shipping_log thuộc về một đơn hàng
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope lọc theo mã vận đơn
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $trackingNumber
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithTrackingNumber($query, $trackingNumber)
    {
        return $query->where('tracking_number', $trackingNumber);
    }

    /**
     * Scope lọc theo mã sự kiện
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|int $eventCode
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithEventCode($query, $eventCode)
    {
        return $query->where('event_code', $eventCode);
    }

    /**
     * Scope lọc theo khoảng thời gian
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('event_time', [$startDate, $endDate]);
    }

    /**
     * Scope lấy các sự kiện mới nhất
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLatestEvents($query, $limit = 10)
    {
        return $query->orderBy('event_time', 'desc')->limit($limit);
    }

    /**
     * Lấy trạng thái vận chuyển mới nhất của một đơn hàng
     *
     * @param int $orderId
     * @return ShippingLog|null
     */
    public static function getLatestStatus($orderId)
    {
        return self::where('order_id', $orderId)
            ->orderBy('event_time', 'desc')
            ->first();
    }

    /**
     * Lấy lịch sử vận chuyển của một đơn hàng
     *
     * @param int $orderId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getShippingHistory($orderId)
    {
        return self::where('order_id', $orderId)
            ->orderBy('event_time', 'desc')
            ->get();
    }

    /**
     * Kiểm tra xem đơn hàng có bị giao thất bại không
     *
     * @param int $orderId
     * @return bool
     */
    public static function hasDeliveryFailure($orderId)
    {
        return self::where('order_id', $orderId)
            ->where('event_code', self::STATUS_DELIVERY_FAILED)
            ->exists();
    }

    /**
     * Đếm số lần giao hàng thất bại của một đơn hàng
     *
     * @param int $orderId
     * @return int
     */
    public static function countDeliveryFailures($orderId)
    {
        return self::where('order_id', $orderId)
            ->where('event_code', self::STATUS_DELIVERY_FAILED)
            ->count();
    }

    /**
     * Tạo bản ghi shipping log mới
     *
     * @param int $orderId ID của đơn hàng
     * @param string $trackingNumber Mã vận đơn
     * @param string|int $eventCode Mã sự kiện vận chuyển
     * @param array $data Dữ liệu bổ sung
     * @return ShippingLog
     */
    public static function createLog($orderId, $trackingNumber, $eventCode, $data = [])
    {
        $log = new self();
        $log->order_id = $orderId;
        $log->tracking_number = $trackingNumber;
        $log->event_code = $eventCode;

        // Thiết lập tên sự kiện từ mã nếu là số
        if (is_numeric($eventCode) && isset(self::$statusLabels[(int)$eventCode])) {
            $log->event_name = self::$statusLabels[(int)$eventCode];
        } elseif (isset($data['event_name'])) {
            $log->event_name = $data['event_name'];
        } else {
            $log->event_name = 'Sự kiện vận chuyển';
        }

        // Thiết lập các trường từ dữ liệu bổ sung
        if (isset($data['carrier'])) {
            $log->carrier = $data['carrier'];
        }

        if (isset($data['event_description'])) {
            $log->event_description = $data['event_description'];
        }

        if (isset($data['event_time'])) {
            $log->event_time = $data['event_time'];
        } else {
            $log->event_time = now();
        }

        if (isset($data['location'])) {
            $log->location = $data['location'];
        }

        if (isset($data['location_code'])) {
            $log->location_code = $data['location_code'];
        }

        if (isset($data['handler_name'])) {
            $log->handler_name = $data['handler_name'];
        }

        if (isset($data['handler_phone'])) {
            $log->handler_phone = $data['handler_phone'];
        }

        if (isset($data['notes'])) {
            $log->notes = $data['notes'];
        }

        // Lưu dữ liệu gốc nếu có
        if (isset($data['raw_data'])) {
            $log->raw_data = $data['raw_data'];
        }

        $log->save();

        return $log;
    }
}
