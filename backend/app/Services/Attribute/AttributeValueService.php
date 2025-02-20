<?php

namespace App\Services\Attribute;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Services\BaseService;
use Exception;

/**
 * Service class for handling Attribute Value operations
 * Lớp Service xử lý các thao tác liên quan đến giá trị thuộc tính sản phẩm
 */
class AttributeValueService extends BaseService
{
    /**
     * Constructor
     * Khởi tạo service với model AttributeValue
     * 
     * @param AttributeValue $attributeValue The AttributeValue model instance / Instance của model AttributeValue
     */
    public function __construct(AttributeValue $attributeValue)
    {
        parent::__construct($attributeValue);
    }

    /**
     * Apply filters to the query
     * Áp dụng các bộ lọc vào truy vấn
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance / Instance của query builder
     * @param array $filters Array of filter parameters / Mảng các tham số lọc
     */
    protected function applyFilters($query, array $filters): void
    {
        if (isset($filters['attribute_id'])) {
            $query->where('attribute_id', $filters['attribute_id']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('value', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }
    }

    /**
     * Apply default ordering to the query
     * Áp dụng sắp xếp mặc định vào truy vấn
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance / Instance của query builder
     */
    protected function defaultOrder($query): void
    {
        $query->orderBy('value', 'asc');
    }

    /**
     * Get attribute values for a specific attribute with pagination
     * Lấy danh sách giá trị của một thuộc tính với phân trang
     * 
     * @param int $attribute_id The ID of the attribute / ID của thuộc tính
     * @param int|null $perPage Number of items per page / Số lượng item trên mỗi trang
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     * @throws Exception If attribute not found / Nếu không tìm thấy thuộc tính
     */
    public function getAttributeValues($attribute_id, $perPage = null)
    {
        // Verify attribute exists
        if (!Attribute::find($attribute_id)) {
            throw new Exception('Attribute not found');
        }

        return $this->getAll(
            ['attribute_id' => $attribute_id],
            ['attribute'],
            $perPage
        );
    }
}
