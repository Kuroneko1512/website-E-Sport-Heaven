<?php
namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Exception;

abstract class BaseService
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function create(array $data)
    {
        try {
            return $this->model->create($data);
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi tạo dữ liệu: " . $e->getMessage());
        }
    }

    public function update($id, array $data)
    {
        try {
            return $this->model->findOrFail($id)->update($data);
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi cập nhật dữ liệu: " . $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            $record = $this->model->findOrFail($id);
            return  $record->delete();
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi xóa dữ liệu: " . $e->getMessage());
        }
    }
    public function show($id)
    {
        try {
            $record = $this->model->findOrFail($id);
            return  $record;
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi lấy dữ liệu: " . $e->getMessage());
        }
    }

    /**
     * Lấy dữ liệu với tùy chọn phân trang, lọc và sắp xếp
     *
     * @param array $filters Mảng các điều kiện lọc
     * @param array $sort Mảng các điều kiện sắp xếp
     * @param int|null $paginate Số lượng phân trang (null nếu không phân trang)
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAll( $paginate = null)
    {
        try {
            $query = $this->model->query();

            // Áp dụng điều kiện lọc
            // Trả về kết quả: Phân trang hoặc lấy tất cả
            return $paginate ? $query->paginate($paginate) : $query->get();

        } catch (QueryException $e) {
            throw new Exception("Lỗi khi truy vấn dữ liệu: " . $e->getMessage());
        } catch (Exception $e) {
            throw new Exception("Lỗi không xác định: " . $e->getMessage());
        }
    }
}

