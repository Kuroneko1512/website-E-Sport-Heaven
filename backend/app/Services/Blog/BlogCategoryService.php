<?php

namespace App\Services\Blog;

use App\Models\BlogCategory;
use App\Services\BaseService;

class BlogCategoryService extends BaseService
{
    // Constructor nhận vào đối tượng BlogCategory và gọi constructor của lớp cha (BaseService)
    public function __construct(BlogCategory $blogCategory)
    {
        parent::__construct($blogCategory);  // Gọi constructor của lớp cha và truyền đối tượng BlogCategory
    }

    // Phương thức lấy tất cả các danh mục blog với phân trang (mặc định là 10)
    public function getCategories($paginate = 10)
    {
        // Gọi phương thức getAll của BaseService để lấy danh sách danh mục blog với phân trang
        return $this->getAll($paginate);
    }

    // Phương thức tạo mới một danh mục blog
    public function createCategory(array $data)
    {
        // Gọi phương thức create của BaseService để tạo mới danh mục
        return $this->create($data);
    }

    // Phương thức cập nhật danh mục blog theo ID
    public function updateCategory($id, array $data)
    {
        // Gọi phương thức update của BaseService để cập nhật danh mục blog
        return $this->update($id, $data);
    }

    // Phương thức xóa danh mục blog theo ID
    public function deleteCategory($id)
    {
        // Gọi phương thức delete của BaseService để xóa danh mục blog
        return $this->delete($id);
    }

    // Phương thức tìm một danh mục blog theo ID
    public function findCategory($id)
    {
        // Gọi phương thức show của BaseService để lấy thông tin chi tiết của danh mục
        return $this->show($id);
    }
}
