<?php

namespace App\Services\Blog;

use App\Models\BlogCategory;
use App\Services\BaseService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Validation\ValidationException;

class BlogCategoryService extends BaseService
{
    protected $rules = [
        'name' => 'required|string|max:255',
        'slug' => 'nullable|string|max:255',
        'description' => 'nullable|string|max:255'
    ];

    public function __construct(BlogCategory $blogCategory)
    {
        parent::__construct($blogCategory);
    }

    public function getCategories($paginate = 10)
    {
        try {
            return $this->getAll($paginate);
        } catch (Exception $e) {
            throw new Exception('Error getting blog categories: ' . $e->getMessage());
        }
    }

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
