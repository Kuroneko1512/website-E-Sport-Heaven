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
            throw new Exception('Error getting blog categories: ' . $e->getMessage());
        }
    }

    // Phương thức tạo mới một danh mục blog
    public function createCategory(array $data)
    {
        try {
            $validator = Validator::make($data, $this->rules);
            
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            return $this->create($data);
        } catch (ValidationException $e) {
            throw new Exception('Validation error: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Error creating category: ' . $e->getMessage());
        }
    }

    // Phương thức cập nhật danh mục blog theo ID
    public function updateCategory($id, array $data)
    {
        try {
            $category = $this->model->find($id);
            if (!$category) {
                throw new Exception('Category not found');
            }

            // Modify validation rules for update to ignore current slug
            $rules = $this->rules;
            if (isset($data['slug'])) {
                $rules['slug'] = 'nullable|string|max:255|unique:blog_categories,slug,' . $id;
            }

            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            if (isset($data['name']) && $data['name'] !== $category->name) {
                $data['slug'] = Str::slug($data['name']);
            }

            $category->update($data);
            return $category->fresh();
        } catch (ValidationException $e) {
            throw new Exception('Validation error: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Error updating category: ' . $e->getMessage());
        }
    }

    // Phương thức xóa danh mục blog theo ID
    public function deleteCategory($id)
    {
        try {
            $category = $this->model->find($id);
            if (!$category) {
                throw new Exception('Category not found');
            }

            // Check if category has associated blogs
            if ($category->blogs()->count() > 0) {
                throw new Exception('Cannot delete category with associated blogs');
            }

            return $this->delete($id);
        } catch (Exception $e) {
            throw new Exception('Error deleting category: ' . $e->getMessage());
        }
    }

    // Phương thức tìm một danh mục blog theo ID
    public function findCategory($id)
    {
        try {
            $category = $this->show($id);
            if (!$category) {
                throw new Exception('Category not found');
            }
            return $category;
        } catch (Exception $e) {
            throw new Exception('Error finding category: ' . $e->getMessage());
        }
    }
}
