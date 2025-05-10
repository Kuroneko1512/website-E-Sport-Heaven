<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseTransaction extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các loại giao dịch
     */
    const TYPE_STOCK_IN = 1;       // Nhập kho
    const TYPE_STOCK_OUT = 2;      // Xuất kho
    const TYPE_TRANSFER = 3;       // Chuyển kho
    const TYPE_ADJUSTMENT = 4;     // Kiểm kê/Điều chỉnh

    /**
     * Các loại tham chiếu
     */
    const REF_TYPE_ORDER = 1;      // Đơn hàng
    const REF_TYPE_IMPORT = 2;     // Nhập hàng (từ nhà cung cấp)
    const REF_TYPE_RETURN = 3;     // Đơn trả hàng
    const REF_TYPE_OTHER = 4;      // Khác

    /**
     * Các trạng thái giao dịch
     */
    const STATUS_DRAFT = 0;        // Nháp
    const STATUS_COMPLETED = 1;    // Hoàn thành
    const STATUS_CANCELLED = 2;    // Hủy

    /**
     * Các trường có thể gán giá trị hàng loạt
     *
     * @var array
     */
    protected $fillable = [
        'transaction_code',
        'warehouse_id',
        'warehouse_name',
        'destination_warehouse_id',
        'destination_warehouse_name',
        'transaction_type',
        'reference_type',
        'reference_code',
        'admin_id',
        'admin_name',
        'notes',
        'status',
        'cancel_reason',
    ];

    /**
     * Các trường được ép kiểu
     *
     * @var array
     */
    protected $casts = [
        'warehouse_id' => 'integer',
        'destination_warehouse_id' => 'integer',
        'transaction_type' => 'integer',
        'reference_type' => 'integer',
        'admin_id' => 'integer',
        'status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Các thuộc tính mặc định
     *
     * @var array
     */
    protected $attributes = [
        'status' => self::STATUS_DRAFT,
    ];

    /**
     * Lấy nhãn loại giao dịch
     * 
     * @return string
     */
    public function getTypeNameAttribute()
    {
        $types = [
            self::TYPE_STOCK_IN => 'Stock In',        // Nhập kho
            self::TYPE_STOCK_OUT => 'Stock Out',      // Xuất kho
            self::TYPE_TRANSFER => 'Transfer',        // Chuyển kho
            self::TYPE_ADJUSTMENT => 'Adjustment',    // Kiểm kê/Điều chỉnh
        ];

        return $types[$this->transaction_type] ?? 'Unknown';
    }

    /**
     * Lấy nhãn loại tham chiếu
     * 
     * @return string
     */
    public function getReferenceTypeNameAttribute()
    {
        $types = [
            self::REF_TYPE_ORDER => 'Order',          // Đơn hàng
            self::REF_TYPE_IMPORT => 'Import',        // Nhập hàng
            self::REF_TYPE_RETURN => 'Return',        // Đơn trả hàng
            self::REF_TYPE_OTHER => 'Other',          // Khác
        ];

        return $types[$this->reference_type] ?? 'Unknown';
    }

    /**
     * Lấy nhãn trạng thái giao dịch
     * 
     * @return string
     */
    public function getStatusNameAttribute()
    {
        $statuses = [
            self::STATUS_DRAFT => 'Draft',            // Nháp
            self::STATUS_COMPLETED => 'Completed',    // Hoàn thành
            self::STATUS_CANCELLED => 'Cancelled',    // Hủy
        ];

        return $statuses[$this->status] ?? 'Unknown';
    }

    /**
     * Kiểm tra xem giao dịch có thể chỉnh sửa không
     * 
     * @return bool
     */
    public function isEditable()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Kiểm tra xem giao dịch có thể hoàn thành không
     * 
     * @return bool
     */
    public function canComplete()
    {
        return $this->status === self::STATUS_DRAFT && $this->items()->count() > 0;
    }

    /**
     * Kiểm tra xem giao dịch có thể hủy không
     * 
     * @return bool
     */
    public function canCancel()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Tính tổng số lượng sản phẩm trong giao dịch
     * 
     * @return int
     */
    public function getTotalQuantityAttribute()
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Tính tổng giá trị giao dịch
     * 
     * @return float
     */
    public function getTotalValueAttribute()
    {
        return $this->items()->sum('total_cost');
    }

    /**
     * Quan hệ với bảng warehouses
     * Một giao dịch thuộc về một kho nguồn
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Quan hệ với bảng warehouses (kho đích)
     * Một giao dịch chuyển kho thuộc về một kho đích
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function destinationWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id');
    }

    /**
     * Quan hệ với bảng admins
     * Một giao dịch được tạo bởi một admin
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    /**
     * Quan hệ với bảng warehouse_transaction_items
     * Một giao dịch có nhiều mục
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items()
    {
        return $this->hasMany(WarehouseTransactionItem::class, 'transaction_id');
    }

    /**
     * Quan hệ với bảng orders (nếu là giao dịch liên quan đến đơn hàng)
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'reference_code', 'order_code')
            ->where('reference_type', self::REF_TYPE_ORDER);
    }

    /**
     * Scope lọc theo loại giao dịch
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope lọc theo trạng thái
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope lọc các giao dịch nháp
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDrafts($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope lọc các giao dịch đã hoàn thành
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope lọc các giao dịch đã hủy
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    /**
     * Scope tìm kiếm theo mã giao dịch
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $code
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchByCode($query, $code)
    {
        return $query->where('transaction_code', 'like', "%{$code}%");
    }

    /**
     * Scope tìm kiếm theo mã tham chiếu
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $code
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearchByReferenceCode($query, $code)
    {
        return $query->where('reference_code', 'like', "%{$code}%");
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
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
