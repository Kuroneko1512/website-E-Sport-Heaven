<?php

namespace App\Services\Blog;

use App\Models\Blog;
use App\Services\BaseService;

class BlogService extends BaseService
{
    // Constructor nhận vào đối tượng Blog và gọi constructor của lớp cha (BaseService)
    public function __construct(Blog $blog)
    {
        parent::__construct($blog);  // Gọi constructor của lớp cha và truyền đối tượng Blog
    }

    // Phương thức lấy tất cả các bài viết blog với phân trang (mặc định là 10)
    public function getBlogs($paginate = 10)
    {
        // Gọi phương thức getAll của BaseService để lấy danh sách bài viết blog với phân trang
        return $this->getAll($paginate);
    }

    // Phương thức tạo mới một bài viết blog
    public function createBlog(array $data)
    {
        // Gọi phương thức create của BaseService để tạo mới bài viết
        return $this->create($data);
    }

    // Phương thức cập nhật bài viết blog theo ID
    public function updateBlog($id, array $data)
    {
        // Gọi phương thức update của BaseService để cập nhật bài viết blog
        return $this->update($id, $data);
    }

    // Phương thức xóa bài viết blog theo ID
    public function deleteBlog($id)
    {
        // Gọi phương thức delete của BaseService để xóa bài viết blog
        return $this->delete($id);
    }

    // Phương thức tìm một bài viết blog theo ID
    public function findBlog($id)
    {
        // Gọi phương thức show của BaseService để lấy thông tin chi tiết của bài viết
        return $this->show($id);
    }
}
