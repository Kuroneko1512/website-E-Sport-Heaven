<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseStock extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các tình trạng mặt hàng
     */
    const CONDITION_NEW = 1;                // Mới
    const CONDITION_USED_GOOD = 2;          // Đã qua sử dụng - còn tốt 
    const CONDITION_MINOR_DEFECT = 3;       // Lỗi nhẹ 
    const CONDITION_DEFECTIVE = 4;          // Lỗi/Hỏng

    /**
     * Các trường có thể gán giá trị hàng loạt
     *
     * @var array
     */
    protected $fillable = [
        'warehouse_id',
        'product_id',
        'product_variant_id',
        'product_sku',
        'variant_sku',
        'quantity',
        'allocated_quantity',
        'item_condition',
        'location',
        'min_quantity',
        'max_quantity',
        'is_active',
    ];

    /**
     * Các trường được ép kiểu
     *
     * @var array
     */
    protected $casts = [
        'warehouse_id' => 'integer',
        'product_id' => 'integer',
        'product_variant_id' => 'integer',
        'quantity' => 'integer',
        'item_condition' => 'integer',
        'min_quantity' => 'integer',
        'max_quantity' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Các thuộc tính mặc định
     *
     * @var array
     */
    protected $attributes = [
        'quantity' => 0,
        'item_condition' => self::CONDITION_NEW,
        'min_quantity' => 0,
        'is_active' => true,
    ];

    /**
     * Lấy nhãn tình trạng mặt hàng
     *
     * @return string
     */
    public function getConditionNameAttribute()
    {
        $conditions = [
            self::CONDITION_NEW => 'New',                      // Mới
            self::CONDITION_USED_GOOD => 'Used - Good',        // Đã qua sử dụng - còn tốt
            self::CONDITION_MINOR_DEFECT => 'Minor Defect',    // Lỗi nhẹ
            self::CONDITION_DEFECTIVE => 'Defective/Damaged',  // Lỗi/Hỏng
        ];

        return $conditions[$this->item_condition] ?? 'Unknown';
    }

    /**
     * Kiểm tra xem tồn kho có dưới mức tối thiểu không
     *
     * @return bool
     */
    public function isLowStock()
    {
        return $this->quantity <= $this->min_quantity;
    }

    /**
     * Kiểm tra xem tồn kho có vượt mức tối đa không
     *
     * @return bool
     */
    public function isOverStock()
    {
        return $this->max_quantity && $this->quantity >= $this->max_quantity;
    }

    /**
     * Quan hệ với bảng warehouses
     * Một bản ghi tồn kho thuộc về một kho
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Quan hệ với bảng products
     * Một bản ghi tồn kho thuộc về một sản phẩm
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Quan hệ với bảng product_variants
     * Một bản ghi tồn kho có thể thuộc về một biến thể sản phẩm
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Scope lọc theo kho
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $warehouseId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    /**
     * Scope lọc theo sản phẩm
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $productId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope lọc theo biến thể
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $variantId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfVariant($query, $variantId)
    {
        return $query->where('product_variant_id', $variantId);
    }

    /**
     * Scope lọc theo tình trạng mặt hàng
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $condition
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithCondition($query, $condition)
    {
        return $query->where('item_condition', $condition);
    }

    /**
     * Scope lọc các mặt hàng có thể bán lại
     * (Mới, Đã qua sử dụng - còn tốt, Lỗi nhẹ)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSellable($query)
    {
        return $query->whereIn('item_condition', [
            self::CONDITION_NEW,
            self::CONDITION_USED_GOOD,
            self::CONDITION_MINOR_DEFECT
        ]);
    }

    /**
     * Scope lọc các mặt hàng không thể bán lại (lỗi/hỏng)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDefective($query)
    {
        return $query->where('item_condition', self::CONDITION_DEFECTIVE);
    }

    /**
     * Scope lọc các mặt hàng đang hoạt động
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope lọc các mặt hàng có tồn kho dưới mức tối thiểu
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= min_quantity');
    }
    /**
     * Scope tìm kiếm theo SKU (sản phẩm hoặc biến thể)
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $sku
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchBySku($query, $sku)
    {
        return $query->where('product_sku', 'like', "%{$sku}%")
            ->orWhere('variant_sku', 'like', "%{$sku}%");
    }
}
