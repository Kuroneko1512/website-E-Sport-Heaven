<?php

namespace App\Services\Attribute;

use App\Models\Attribute;
use App\Services\BaseService;

/**
 * Service class for handling Attribute operations
 * Lớp Service xử lý các thao tác liên quan đến thuộc tính sản phẩm
 */
class AttributeService extends BaseService
{
    /**
     * Constructor
     * Khởi tạo service với model Attribute
     * 
     * @param Attribute $attribute The Attribute model instance / Instance của model Attribute
     */
    public function __construct(Attribute $attribute)
    {
        parent::__construct($attribute);
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
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
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
        $query->orderBy('name', 'asc');
    }

    /**
     * Get attributes with optional pagination
     * Lấy danh sách thuộc tính với tùy chọn phân trang
     * 
     * @param int|null $perPage Number of items per page / Số lượng item trên mỗi trang
     * @param array $filters Optional filters / Các bộ lọc tùy chọn
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function getAttributes($perPage = null, array $filters = [])
    {
        return $this->getAll($filters, ['attributeValues'], $perPage);
    }
}
