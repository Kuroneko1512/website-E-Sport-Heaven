<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderReturnItem extends Model
{
    use HasFactory, SoftDeletes;

    // Các trạng thái sản phẩm
    const CONDITION_NEW = 0;          // Sản phẩm mới
    const CONDITION_USED = 1;         // Đã sử dụng
    const CONDITION_DAMAGED = 2;      // Hư hỏng

    // Các trạng thái xử lý
    const STATUS_PENDING = 0;         // Chờ xử lý
    const STATUS_APPROVED = 1;        // Đã duyệt
    const STATUS_RECEIVED = 2;        // Đã nhận
    const STATUS_REJECTED = 3;        // Từ chối

    // Các hành động xử lý
    const ACTION_NONE = 0;            // Chưa xử lý
    const ACTION_RESTOCK = 1;         // Hoàn kho
    const ACTION_DISPOSE = 2;         // Hủy
    const ACTION_REPLACE = 3;         // Đổi mới

    // Nhãn hiển thị cho các loại
    public static $conditionLabels = [
        self::CONDITION_NEW => 'Mới',
        self::CONDITION_USED => 'Đã sử dụng',
        self::CONDITION_DAMAGED => 'Hư hỏng'
    ];

    public static $statusLabels = [
        self::STATUS_PENDING => 'Chờ xử lý',
        self::STATUS_APPROVED => 'Đã duyệt',
        self::STATUS_RECEIVED => 'Đã nhận',
        self::STATUS_REJECTED => 'Từ chối'
    ];

    public static $actionLabels = [
        self::ACTION_NONE => 'Chưa xử lý',
        self::ACTION_RESTOCK => 'Hoàn kho',
        self::ACTION_DISPOSE => 'Hủy',
        self::ACTION_REPLACE => 'Đổi mới'
    ];

    protected $fillable = [
        'order_return_id',
        'order_item_id',
        'product_name',
        'product_sku',
        'variant_sku',
        'variant_attributes',
        'product_image',
        'quantity_ordered',
        'quantity_returned',
        'price',
        'subtotal',
        'item_condition',
        'return_reason_type',
        'return_reason',
        'status',
        'action_taken',
        'admin_note'
    ];

    protected $casts = [
        'variant_attributes' => 'array',
    ];

    // Accessor để lấy nhãn loại
    public function getConditionLabelAttribute()
    {
        return self::$conditionLabels[$this->item_condition] ?? 'Unknown';
    }

    public function getStatusLabelAttribute()
    {
        return self::$statusLabels[$this->status] ?? 'Unknown';
    }

    public function getActionTakenLabelAttribute()
    {
        return self::$actionLabels[$this->action_taken] ?? 'Unknown';
    }

    public function getReasonTypeLabelAttribute()
    {
        return OrderReturn::$reasonTypeLabels[$this->return_reason_type] ?? 'Unknown';
    }

    /**
     * Quan hệ với bảng order_returns
     */
    public function orderReturn()
    {
        return $this->belongsTo(OrderReturn::class);
    }

    /**
     * Quan hệ với bảng order_items
     */
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
