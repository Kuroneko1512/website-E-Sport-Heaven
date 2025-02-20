<?php

namespace App\Services;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

abstract class BaseService
{
    // Thuộc tính lưu mô hình mà service này xử lý (Attribute, Category, ...)
    protected $model;
     // Constructor nhận vào một mô hình và gán cho thuộc tính $model
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get all records with optional filters and relationships
     * Lấy tất cả bản ghi với bộ lọc và relationships tùy chọn
     * 
     * @param array $filters Optional filters / Bộ lọc tùy chọn
     * @param array $with Relationships to eager load / Các relationships cần eager load
     * @param int|null $perPage Number of items per page / Số lượng item trên mỗi trang
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function getAll(array $filters = [], array $with = [], $perPage = null)
    {
        $query = $this->model->with($with);
        
        $this->applyFilters($query, $filters);
        $this->defaultOrder($query);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    /**
     * Find a record by its ID with optional relationships
     * Tìm một bản ghi theo ID với relationships tùy chọn
     * 
     * @param int $id ID of the record / ID của bản ghi
     * @param array $with Relationships to eager load / Các relationships cần eager load
     * @return Model
     * @throws Exception If record not found / Nếu không tìm thấy bản ghi
     */
    public function find($id, array $with = [])
    {
        $record = $this->model->with($with)->find($id);
        
        if (!$record) {
            throw new Exception('Record not found');
        }
        
        return $record;
    }

    /**
     * Create a new record
     * Tạo một bản ghi mới
     * 
     * @param array $data Data for the new record / Dữ liệu cho bản ghi mới
     * @return Model The created record / Bản ghi đã được tạo
     */
    public function create(array $data)
    {
        try {
            DB::beginTransaction();
            
            $record = $this->model->create($data);
            
            $this->afterCreate($record, $data);
            
            DB::commit();
            return $record;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing record
     * Cập nhật một bản ghi đã tồn tại
     * 
     * @param array $data New data for the record / Dữ liệu mới cho bản ghi
     * @param int $id ID of the record to update / ID của bản ghi cần cập nhật
     * @return Model The updated record / Bản ghi đã được cập nhật
     * @throws Exception If record not found / Nếu không tìm thấy bản ghi
     */
    public function update(array $data, $id)
    {
        try {
            DB::beginTransaction();
            
            $record = $this->find($id);
            $record->update($data);
            
            $this->afterUpdate($record, $data);
            
            DB::commit();
            return $record;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a record
     * Xóa một bản ghi
     * 
     * @param int $id ID of the record to delete / ID của bản ghi cần xóa
     * @param bool $force Force delete the record / Xóa hoàn toàn bản ghi
     * @return bool True if successful / True nếu thành công
     * @throws Exception If record not found or cannot be deleted / Nếu không tìm thấy bản ghi hoặc không thể xóa
     */
    public function delete($id, bool $force = false): bool
    {
        $record = $this->find($id);

        if ($force) {
            return $record->forceDelete();
        }

        return $record->delete();
    }

    /**
     * Restore a soft deleted record
     * Khôi phục một bản ghi đã xóa mềm
     * 
     * @param int $id ID of the record to restore / ID của bản ghi cần khôi phục
     * @return bool True if successful / True nếu thành công
     * @throws Exception If record not found / Nếu không tìm thấy bản ghi
     */
    public function restore($id): bool
    {
        $record = $this->model->withTrashed()->find($id);

        if (!$record) {
            throw new Exception('Record not found');
        }

        return $record->restore();
    }

    /**
     * Get all soft deleted records
     * Lấy tất cả các bản ghi đã xóa mềm
     * 
     * @param array $filters Optional filters / Bộ lọc tùy chọn
     * @param array $with Relationships to eager load / Các relationships cần eager load
     * @param int|null $perPage Number of items per page / Số lượng item trên mỗi trang
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function getTrashed(array $filters = [], array $with = [], $perPage = null)
    {
        $query = $this->model->onlyTrashed();

        if (!empty($with)) {
            $query->with($with);
        }

        $this->applyFilters($query, $filters);
        $this->defaultOrder($query);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    /**
     * Hook method called after record creation
     * Method hook được gọi sau khi tạo bản ghi
     * 
     * @param Model $record The created record / Bản ghi đã được tạo
     * @param array $data Original data used to create the record / Dữ liệu gốc được sử dụng để tạo bản ghi
     */
    protected function afterCreate(Model $record, array $data): void
    {
        // Override in child classes if needed
    }

    /**
     * Hook method called after record update
     * Method hook được gọi sau khi cập nhật bản ghi
     * 
     * @param Model $record The updated record / Bản ghi đã được cập nhật
     * @param array $data Original data used to update the record / Dữ liệu gốc được sử dụng để cập nhật bản ghi
     */
    protected function afterUpdate(Model $record, array $data): void
    {
        // Override in child classes if needed
    }

    /**
     * Check if a record can be deleted
     * Kiểm tra xem một bản ghi có thể bị xóa không
     * 
     * @param Model $record The record to check / Bản ghi cần kiểm tra
     * @return bool True if the record can be deleted / True nếu bản ghi có thể bị xóa
     */
    protected function canDelete(Model $record): bool
    {
        return true; // Override in child classes if needed
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
        // Override in child classes if needed
    }

    /**
     * Apply default ordering to the query
     * Áp dụng sắp xếp mặc định vào truy vấn
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance / Instance của query builder
     */
    protected function defaultOrder($query): void
    {
        // Override in child classes if needed
    }
}
