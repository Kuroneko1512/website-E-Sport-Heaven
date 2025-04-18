<?php

namespace App\Http\Controllers\Api\Blog\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\BlogCategoryStoreRequest;
use App\Http\Requests\Blog\BlogCategoryUpdateRequest;
use App\Services\Blog\BlogCategoryService;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

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
    public function store(BlogCategoryStoreRequest $request)
    {
        try {
            $data = $request->validated(); 
            $category = $this->blogCategoryService->createCategory($data); // Tạo mới danh mục blog

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Danh mục blog đã được tạo thành công!' 
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực dữ liệu',
                'errors' => $e->validator->errors()->all()
            ], 422);
        } catch (Exception $e) {
            Log::error('Lỗi khi tạo danh mục blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo danh mục blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Cập nhật danh mục blog
    public function update(BlogCategoryUpdateRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $category = $this->blogCategoryService->updateCategory($id, $data);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Danh mục blog đã được cập nhật thành công'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực dữ liệu',
                'errors' => $e->validator->errors()->all()
            ], 422);
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật danh mục blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật danh mục blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    // Xóa danh mục blog
    public function destroy($id)
    {
        try {
            $this->blogCategoryService->deleteCategory($id); // Changed here
            return response()->json([
                'success' => true,
                'message' => 'Danh mục blog đã được xóa thành công!'
            ], 200);
        } catch (Exception $e) {
            Log::error('Lỗi khi xóa danh mục blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Lỗi khi xóa danh mục blog',
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
                'success' => true,
                'status' => 200,
                'data' => $category
            ], 200);
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy thông tin danh mục blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin danh mục blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
