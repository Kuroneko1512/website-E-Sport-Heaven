<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các loại kho
     */
    const TYPE_SALES = 1;       // Kho bán hàng
    const TYPE_RETURNS = 2;     // Kho trả về
    const TYPE_OTHER = 3;    // Kho khác

    /**
     * Các trường có thể gán giá trị hàng loạt
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'code',
        'type',
        'address',
        'phone',
        'email',
        'manager_name',
        'manager_id',
        'is_active',
        'description',
    ];

    /**
     * Các trường được ép kiểu
     *
     * @var array
     */
    protected $casts = [
        'type' => 'integer',
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
        'type' => self::TYPE_SALES,
        'is_active' => true,
    ];

    /**
     * Lấy nhãn loại kho
     *
     * @return string
     */
    public function getTypeNameAttribute()
    {
        $types = [
            self::TYPE_SALES => 'Sales Warehouse',      // Kho bán hàng
            self::TYPE_RETURNS => 'Returns Warehouse',  // Kho trả về
            self::TYPE_OTHER => 'Other Warehouse', // Kho khác
        ];

        return $types[$this->type] ?? 'Unknown';
    }

    /**
     * Lấy trạng thái kho dưới dạng chuỗi
     *
     * @return string
     */
    public function getStatusNameAttribute()
    {
        return $this->is_active ? 'Active' : 'Inactive'; // Đang hoạt động : Ngừng hoạt động
    }

    /**
     * Quan hệ với bảng warehouse_stocks
     * Một kho có nhiều bản ghi tồn kho
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class, 'warehouse_id');
    }

    /**
     * Quan hệ với bảng warehouse_transactions
     * Một kho có nhiều giao dịch
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions()
    {
        return $this->hasMany(WarehouseTransaction::class, 'warehouse_id');
    }

    /**
     * Quan hệ với bảng warehouse_transactions (kho đích)
     * Một kho có thể là đích đến của nhiều giao dịch chuyển kho
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function incomingTransfers()
    {
        return $this->hasMany(WarehouseTransaction::class, 'destination_warehouse_id');
    }

    /**
     * Quan hệ với bảng admins
     * Một kho có thể có một người quản lý
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function manager()
    {
        return $this->belongsTo(Admin::class, 'manager_id');
    }

    /**
     * Scope lọc kho đang hoạt động
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope lọc theo loại kho
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
