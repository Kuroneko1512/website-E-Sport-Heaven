<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;
    // Các loại sản phẩm
    const PRODUCT_TYPE_SIMPLE = 0;    // Sản phẩm đơn giản
    const PRODUCT_TYPE_VARIABLE = 1;  // Sản phẩm có biến thể

    // Các trạng thái hoàn hàng
    const RETURN_STATUS_NOT_RETURNED = 0;     // Không hoàn hàng
    const RETURN_STATUS_REQUESTED = 1;        // Đã yêu cầu hoàn hàng
    const RETURN_STATUS_RETURNED = 2;         // Đã hoàn hàng
    const RETURN_STATUS_REJECTED = 3;         // Từ chối hoàn hàng

    // Nhãn hiển thị cho các trạng thái
    public static $productTypeLabels = [
        self::PRODUCT_TYPE_SIMPLE => 'Sản phẩm đơn giản',
        self::PRODUCT_TYPE_VARIABLE => 'Sản phẩm có biến thể'
    ];

    public static $returnStatusLabels = [
        self::RETURN_STATUS_NOT_RETURNED => 'Không hoàn hàng',
        self::RETURN_STATUS_REQUESTED => 'Đã yêu cầu hoàn hàng',
        self::RETURN_STATUS_RETURNED => 'Đã hoàn hàng',
        self::RETURN_STATUS_REJECTED => 'Từ chối hoàn hàng'
    ];

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'product_type',
        'product_variant_id',
        'variant_sku',
        'variant_attributes',
        'product_image',
        'quantity',
        'returned_quantity',
        'return_status',
        'return_reason',
        'price',
        'original_price',
        'subtotal',
        'refunded_amount'
    ];

    protected $casts = [
        'variant_attributes' => 'array',
    ];

    // Accessor để lấy nhãn trạng thái
    public function getProductTypeLabelAttribute()
    {
        return self::$productTypeLabels[$this->product_type] ?? 'Unknown';
    }

    public function getReturnStatusLabelAttribute()
    {
        return self::$returnStatusLabels[$this->return_status] ?? 'Unknown';
    }

    /**
     * Quan hệ với bảng orders (Một order_item thuộc về một đơn hàng)
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Quan hệ với bảng products (Một order_item thuộc về một sản phẩm)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Quan hệ với bảng product_variants (Một order_item có thể có một biến thể sản phẩm)
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Quan hệ với bảng order_return_items (Một order_item có thể có nhiều yêu cầu hoàn hàng)
     */
    public function returnItems()
    {
        return $this->hasMany(OrderReturnItem::class);
    }
}
