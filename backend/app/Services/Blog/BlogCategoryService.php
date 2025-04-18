<?php

namespace App\Services\Blog;

use App\Models\BlogCategory;
use App\Services\BaseService;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BlogCategoryService extends BaseService
{
    protected $rules = [
        'name' => 'required|string|max:255|unique:blog_categories,name',
        'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
        'description' => 'nullable|string|max:255'
    ];
    // Constructor nhận vào đối tượng BlogCategory và gọi constructor của lớp cha (BaseService)
    public function __construct(BlogCategory $blogCategory)
    {
        parent::__construct($blogCategory);  // Gọi constructor của lớp cha và truyền đối tượng BlogCategory
    }

    // Phương thức lấy tất cả các danh mục blog với phân trang (mặc định là 10)
    public function getCategories($paginate = 10)
    {
        try {
            return $this->getAll($paginate);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi lấy danh sách danh mục blog: ' . $e->getMessage()); // Nếu có lỗi thì ném ra exception
        }
    }

    // Phương thức tạo mới một danh mục blog
    public function createCategory(array $data)
    {
        try {
            // Kiểm tra dữ liệu đầu vào theo $rules
            $validator = Validator::make($data, $this->rules);
            
            if ($validator->fails()) {
                // Nếu lỗi validate, ném ra ngoại lệ ValidationException
                throw new ValidationException($validator);
            }

            // Nếu không nhập slug, thì tự động tạo từ name
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            return $this->create($data);

        } catch (ValidationException $e) {
            // Ném ra lỗi validate với tất cả thông báo lỗi gom lại
            throw new Exception('Lỗi xác thực: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tạo danh mục: ' . $e->getMessage());
        }
    }

    // Phương thức cập nhật danh mục blog theo ID
    public function updateCategory($id, array $data)
    {
        try {
            $category = $this->model->find($id);
            if (!$category) {
                throw new Exception('Không tìm thấy danh mục.');// Nếu không tìm thấy
            }

            $rules = $this->rules;
            if (isset($data['slug'])) {
                $rules['slug'] = 'nullable|string|max:255|unique:blog_categories,slug,' . $id;
            }

            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Nếu đổi tên => cập nhật lại slug theo tên mới
            if (isset($data['name']) && $data['name'] !== $category->name) {
                $data['slug'] = Str::slug($data['name']);
            }

            $category->update($data);
            return $category->fresh(); // Trả về dữ liệu
        } catch (ValidationException $e) {
            throw new Exception('Lỗi xác thực: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi cập nhật danh mục: ' . $e->getMessage());
        }
    }

    // Phương thức xóa danh mục blog theo ID
    public function deleteCategory($id)
    {
        try {
            $category = $this->model->find($id);
            if (!$category) {
                throw new Exception('Không tìm thấy danh mục.');
            }

            // Nếu danh mục có bài viết liên kết thì không cho xoá
            if ($category->blogs()->count() > 0) {
                throw new Exception('Không thể xoá danh mục vì đang có bài viết liên kết.');
            }

            return $this->delete($id);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi xoá danh mục: ' . $e->getMessage());
        }
    }

    // Phương thức tìm một danh mục blog theo ID
    public function findCategory($id)
    {
        try {
            $category = $this->show($id);
            if (!$category) {
                throw new Exception('Không tìm thấy danh mục.');
            }
            return $category;
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tìm danh mục: ' . $e->getMessage());
        }
    }
}
