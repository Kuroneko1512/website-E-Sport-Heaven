<?php
namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Exception;

abstract class BaseService
{
    // Thuộc tính lưu mô hình mà service này xử lý (Attribute, Category, ...)
    protected $model;
     // Constructor nhận vào một mô hình và gán cho thuộc tính $model
    public function __construct(Model $model)
    {
        $this->model = $model;
    }
  // Phương thức tạo mới một bản ghi trong cơ sở dữ liệu
    public function create(array $data)
    {
        try {
            // Tạo bản ghi mới và trả về đối tượng vừa tạo
            return $this->model->create($data);
        } catch (QueryException $e) {
             // Nếu có lỗi khi truy vấn, ném ra exception mới với thông điệp lỗi
            throw new Exception("Lỗi khi tạo dữ liệu: " . $e->getMessage());
        }
    }
      // Phương thức cập nhật bản ghi theo id
    public function update($id, array $data)
    {
        try {
               // Tìm bản ghi theo id và thực hiện cập nhật
            return $this->model->findOrFail($id)->update($data);
        } catch (QueryException $e) {
               // Nếu có lỗi khi truy vấn, ném ra exception mới với thông điệp lỗi
            throw new Exception("Lỗi khi cập nhật dữ liệu: " . $e->getMessage());
        }
    }
     // Phương thức xóa bản ghi theo id
    public function delete($id)
    {
        try {
            // Tìm bản ghi theo id và thực hiện xóa
            $record = $this->model->findOrFail($id);
            return  $record->delete(); // Xóa bản ghi
        } catch (QueryException $e) {
              // Nếu có lỗi khi truy vấn, ném ra exception mới với thông điệp lỗi
            throw new Exception("Lỗi khi xóa dữ liệu: " . $e->getMessage());
        }
    }
     // Phương thức lấy thông tin chi tiết của một bản ghi theo id
    public function show($id)
    {
        try {
            // Tìm bản ghi theo id và trả về
            $record = $this->model->findOrFail($id);
            return  $record;
        } catch (QueryException $e) {
              // Nếu có lỗi khi truy vấn, ném ra exception mới với thông điệp lỗi
            throw new Exception("Lỗi khi lấy dữ liệu: " . $e->getMessage());
        }
    }

    // Phương thức lấy tất cả các bản ghi, có hỗ trợ phân trang
    public function getAll( $paginate = null)
    {
        try {
              // Tạo một truy vấn mới cho mô hình
            $query = $this->model->query();
               // Kiểm tra nếu có phân trang thì sử dụng paginate, nếu không thì lấy tất cả
            return $paginate ? $query->paginate($paginate) : $query->get();

        } catch (QueryException $e) {
             // Nếu có lỗi khi truy vấn, ném ra exception mới với thông điệp lỗi
            throw new Exception("Lỗi khi truy vấn dữ liệu: " . $e->getMessage());
        } catch (Exception $e) {
             // Xử lý lỗi không xác định
            throw new Exception("Lỗi không xác định: " . $e->getMessage());
        }
    }
}

