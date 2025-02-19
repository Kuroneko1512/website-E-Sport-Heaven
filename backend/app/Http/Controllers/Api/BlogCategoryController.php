<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\BlogCategoryStoreRequest;
use App\Http\Requests\Blog\BlogCategoryUpdateRequest;
use App\Services\Blog\BlogCategoryService;
use Exception;

class BlogCategoryController extends Controller
{
    protected $blogCategoryService;

    // Constructor để khởi tạo service
    public function __construct(BlogCategoryService $blogCategoryService)
    {
        $this->blogCategoryService = $blogCategoryService;
    }

    // Lấy danh sách tất cả danh mục blog
    public function index()
    {
        try {
            $categories = $this->blogCategoryService->getCategories(); // Changed here
            return response()->json([
                'status' => 200,
                'data' => $categories
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Tạo mới danh mục blog 
    public function create()
    {
        try {
            return response()->json([
                'message' => 'Trang tạo danh mục blog. Gửi dữ liệu qua POST để tạo mới.'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi vào trang tạo danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Tạo mới danh mục blog
    public function store(BlogCategoryStoreRequest $request)
    {
        try {
            $data = $request->validated();
            $category = $this->blogCategoryService->createCategory($data); // Tạo mới danh mục blog

            return response()->json([
                'message' => 'Danh mục blog đã được tạo thành công!',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi tạo danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Lấy thông tin chi tiết danh mục blog để chỉnh sửa
    public function edit($id)
    {
        try {
            $category = $this->blogCategoryService->findCategory($id); // Lấy danh mục từ DB để chỉnh sửa
            if ($category) {
                return response()->json([
                    'status' => 200,
                    'data' => $category
                ], 200);
            } else {
                return response()->json([
                    'error' => 'Danh mục blog không tồn tại.',
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy thông tin danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Cập nhật danh mục blog
    public function update(BlogCategoryUpdateRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $category = $this->blogCategoryService->updateCategory($id, $data); // Cập nhật danh mục

            return response()->json([
                'message' => 'Danh mục blog đã được cập nhật thành công!',
                'data' => $category
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi cập nhật danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    // Xóa danh mục blog
    public function destroy($id)
    {
        try {
            $this->blogCategoryService->deleteCategory($id); // Changed here
            return response()->json([
                'message' => 'Danh mục blog đã được xóa thành công!'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi xóa danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Lấy thông tin chi tiết danh mục blog
    public function show($id)
    {
        try {
            $category = $this->blogCategoryService->findCategory($id); // Changed here
            return response()->json([
                'status' => 200,
                'data' => $category
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy thông tin danh mục blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
