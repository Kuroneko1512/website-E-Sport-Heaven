<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseTransactionItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trạng thái mặt hàng
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
        'transaction_id',
        'product_id',
        'product_variant_id',
        'product_sku',
        'variant_sku',
        'product_name',
        'variant_attributes',
        'product_image',
        'quantity',
        'item_condition',
        'unit_cost',
        'total_cost',
        'notes',
        'location',
        'batch_number',
        'expiry_date',
    ];

    /**
     * Các trường được ép kiểu
     *
     * @var array
     */
    protected $casts = [
        'transaction_id' => 'integer',
        'product_id' => 'integer',
        'product_variant_id' => 'integer',
        'quantity' => 'integer',
        'item_condition' => 'integer',
        'unit_cost' => 'decimal:0',
        'total_cost' => 'decimal:0',
        'variant_attributes' => 'json',
        'expiry_date' => 'date',
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
        'item_condition' => self::CONDITION_NEW,
    ];

    /**
     * Boot method để tự động tính total_cost khi tạo mới
     * và kiểm tra trạng thái giao dịch khi cập nhật
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->total_cost) && !empty($item->unit_cost) && !empty($item->quantity)) {
                $item->total_cost = $item->quantity * $item->unit_cost;
            }
        });

        static::updating(function ($item) {
            // Lấy model gốc từ database để so sánh
            $original = static::find($item->id);
            if (!$original) {
                return true; // Nếu không tìm thấy bản ghi gốc, cho phép tiếp tục
            }

            // Kiểm tra xem giao dịch có đang ở trạng thái nháp không
            $transaction = $original->transaction;
            if (!$transaction || $transaction->status !== WarehouseTransaction::STATUS_DRAFT) {
                // Nếu không phải trạng thái nháp, hủy bỏ cập nhật
                return false;
            }

            // Nếu là trạng thái nháp, cho phép cập nhật và tính lại total_cost
            if (!empty($item->unit_cost) && !empty($item->quantity)) {
                $item->total_cost = $item->quantity * $item->unit_cost;
            }

            return true;
        });
    }

    /**
     * Lấy nhãn trạng thái mặt hàng
     * 
     * @return string
     */
    public function getConditionLabelAttribute()
    {
        $conditions = [
            self::CONDITION_NEW => 'New',
            self::CONDITION_USED_GOOD => 'Used - Good condition',
            self::CONDITION_MINOR_DEFECT => 'Minor defect',
            self::CONDITION_DEFECTIVE => 'Defective/Damaged',
        ];

        return $conditions[$this->item_condition] ?? 'Unknown';
    }

    /**
     * Kiểm tra xem mục giao dịch có thể chỉnh sửa không
     * Chỉ cho phép chỉnh sửa khi giao dịch đang ở trạng thái nháp
     *
     * @return bool
     */
    public function isEditable()
    {
        return $this->transaction && $this->transaction->status === WarehouseTransaction::STATUS_DRAFT;
    }

    /**
     * Ghi đè phương thức save để kiểm tra trước khi lưu
     *
     * @param array $options
     * @return bool
     */
    public function save(array $options = [])
    {
        // Nếu đang cập nhật (không phải tạo mới) và không thể chỉnh sửa
        if ($this->exists && !$this->isEditable()) {
            throw new \Exception('Không thể cập nhật mục giao dịch: giao dịch không ở trạng thái nháp.');
        }

        return parent::save($options);
    }

    /**
     * Quan hệ với bảng warehouse_transactions
     * Một mục giao dịch thuộc về một giao dịch
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transaction()
    {
        return $this->belongsTo(WarehouseTransaction::class, 'transaction_id');
    }

    /**
     * Quan hệ với bảng products
     * Một mục giao dịch thuộc về một sản phẩm
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Quan hệ với bảng product_variants
     * Một mục giao dịch có thể thuộc về một biến thể sản phẩm
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Scope để lọc theo trạng thái mặt hàng
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
     * Scope để lọc các mặt hàng có thể bán lại
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
     * Scope để lọc các mặt hàng lỗi/hỏng
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDefective($query)
    {
        return $query->where('item_condition', self::CONDITION_DEFECTIVE);
    }

    /**
     * Scope để lọc theo sản phẩm
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
     * Scope để lọc theo biến thể sản phẩm
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
     * Scope để tìm kiếm theo tên sản phẩm
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $name
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchByProductName($query, $name)
    {
        return $query->where('product_name', 'like', "%{$name}%");
    }

    /**
     * Scope để tìm kiếm theo SKU
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

    /**
     * Scope để lọc theo vị trí trong kho
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $location
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAtLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Scope để lọc theo số lô hàng
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $batchNumber
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithBatchNumber($query, $batchNumber)
    {
        return $query->where('batch_number', $batchNumber);
    }

    /**
     * Scope để lọc các mặt hàng sắp hết hạn
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Số ngày trước khi hết hạn
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExpiringWithin($query, $days)
    {
        $today = now();
        $expiryDate = now()->addDays($days);

        return $query->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [$today, $expiryDate]);
    }

    /**
     * Scope để lọc các mặt hàng đã hết hạn
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiry_date')
            ->where('expiry_date', '<', now());
    }
}
