<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttributeValue extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'attribute_id',
        'value',
        'description',
        'image',
    ];

    /**
     * Get the attribute that owns the value.
     * Lấy thuộc tính sở hữu giá trị này.
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    /**
     * Get the product variants that use this value.
     * Lấy các biến thể sản phẩm sử dụng giá trị này.
     */
    public function productVariants()
    {
        return $this->belongsToMany(ProductVariant::class, 'product_attributes')
                    ->withPivot(['attribute_id'])
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include values for a specific attribute.
     * Giới hạn truy vấn chỉ bao gồm các giá trị của một thuộc tính cụ thể.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $attributeId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForAttribute($query, $attributeId)
    {
        return $query->where('attribute_id', $attributeId);
    }

    /**
     * Scope a query to search values by name.
     * Giới hạn truy vấn tìm kiếm giá trị theo tên.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('value', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
    }
}
