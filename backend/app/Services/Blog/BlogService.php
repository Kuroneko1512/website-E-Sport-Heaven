<?php

namespace App\Services\Blog;

use App\Models\Blog;
use App\Services\BaseService;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class BlogService extends BaseService
{
    protected $rules = [];
    // Constructor nhận vào đối tượng Blog và gọi constructor của lớp cha (BaseService)
    public function __construct(Blog $blog)
    {
        parent::__construct($blog);  // Gọi constructor của lớp cha và truyền đối tượng Blog
    }

    // Phương thức lấy tất cả các bài viết blog với phân trang (mặc định là 10)
    public function getBlogs($request)
    {
        try {
            // Validate pagination parameters
            $perPage = $request->input('per_page', 10);
            if ($perPage <= 0 || $perPage > 100) {
                throw new Exception('Invalid pagination parameters. Per page must be between 1 and 100.');
            }

            $query = Blog::query();

            // Search by keyword (in title or content) with index optimization
            if ($request->filled('keyword')) {
                $keyword = trim($request->input('keyword'));
                if (strlen($keyword) >= 3) {
                    $query->where(function ($q) use ($keyword) {
                        $q->where('title', 'like', "%$keyword%")
                          ->orWhere('content', 'like', "%$keyword%");
                    });
                }
            }

            // Filter by category with eager loading optimization
            if ($request->filled('category_id')) {
                $categoryId = $request->input('category_id');
                $query->where('category_id', $categoryId);
            }

            // Filter by featured status
            if ($request->filled('is_featured')) {
                $query->where('is_featured', $request->boolean('is_featured'));
            }

            // Date range filter
            if ($request->filled('start_date')) {
                $query->where('publish_date', '>=', $request->input('start_date'));
            }
            if ($request->filled('end_date')) {
                $timestamp = strtotime(str_replace('GMT+0700 (Indochina Time)', '+0700', $request->input('end_date')));
                $end_date = date('Y-m-d 23:59:59', $timestamp);
                $query->where('publish_date', '<=', $end_date);
            }

            // Apply sorting
            $sortBy = $request->input('sort_by', 'publish_date');
            $sortOrder = $request->input('sort_order', 'desc');
            $allowedSortFields = ['publish_date', 'title', 'created_at'];
            
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, strtolower($sortOrder) === 'asc' ? 'asc' : 'desc');
            } else {
                $query->orderByDesc('publish_date');
            }

            // Eager load relationships
            $query->with(['category']);

            // Return paginated or all results
            return $request->boolean('paginate', true)
                ? $query->paginate($perPage)
                : $query->get();

        } catch (Exception $e) {
            throw new Exception('Error retrieving blog list: ' . $e->getMessage());
        }
    }

    // Phương thức tạo mới một bài viết blog
    public function createBlog(array $data)
    {
        try {
            $validator = Validator::make($data, $this->rules);
            
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Tự động tạo slug từ title nếu không được cung cấp
            if (!isset($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Check slug đã tồn tại
            if ($this->model->where('slug', $data['slug'])->exists()) {
                throw new Exception('Slug đã tồn tại');
            }

            return $this->create($data);
        } catch (ValidationException $e) {
            throw new Exception('Lỗi validation: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tạo blog: ' . $e->getMessage());
        }
    }

    // Phương thức cập nhật bài viết blog theo ID
    public function updateBlog($id, array $data)
    {
        try {
            // Kiểm tra blog có tồn tại
            $blog = $this->findBlog($id);
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }

            // Validate dữ liệu cập nhật
            $validator = Validator::make($data, $this->rules);
            
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Cập nhật slug nếu title thay đổi
            if (isset($data['title']) && !isset($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }
            
            // Check slug đã tồn tại (trừ trường hợp slug của blog đang cập nhật)
            if (isset($data['slug']) && $data['slug'] !== $blog->slug) {
                if ($this->model->where('slug', $data['slug'])->exists()) {
                    throw new Exception('Slug đã tồn tại');
                }
            }

            return $this->update($id, $data);
        } catch (ValidationException $e) {
            throw new Exception('Lỗi validation: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi cập nhật blog: ' . $e->getMessage());
        }
    }

    // Phương thức xóa bài viết blog theo ID
    public function deleteBlog($id)
    {
        try {
            $blog = $this->findBlog($id);
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }
            return $this->delete($id);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi xóa blog: ' . $e->getMessage());
        }
    }

    // Phương thức tìm một bài viết blog theo ID
    public function findBlog($id)
    {
        try {
            return $this->show($id);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tìm blog: ' . $e->getMessage());
        }
    }
    public function findBySlug($slug)
    {
        try {
            $blog = $this->model->where('slug', $slug)->first();
            
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }

            return $blog;
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tìm blog theo slug: ' . $e->getMessage());
        }
    }
}
