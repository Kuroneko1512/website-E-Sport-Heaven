<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Category\CategoryService;
use App\Http\Requests\Category\CategoryStoreRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use Exception;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{

    protected $categoryService;
    // Constructor để khởi tạo service
    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }
    // Lấy danh sách tất cả Danh mục
    public function index(){
        try {
             // Gọi service để lấy dữ liệu
            $categories = $this->categoryService->getCategories();
            return response()->json([
                'status' => 200,
                'data' => $categories, // Trả về dữ liệu Danh mục
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    public function getAllCategories(){
        try {
            // Gọi service để lấy tất cả danh mục
            $categories = $this->categoryService->getAllCategories();
            return response()->json([
                'status' => 200,
                'data' => $categories,
            ],200);
        } catch (\Throwable $th) {
            Log::error($th);
            return response()->json([
                'error' => 'Lấy danh mục thất bại',
                'status' => 500
            ],500);
        }
    }

    public function store(CategoryStoreRequest $request)
    {

        try {
             // Validate và lấy dữ liệu từ request
            $data = $request->validated();
             // Gọi service để tạo mới Danh mục
            $category = $this->categoryService->create($data);

            return response()->json([
                'message' => 'Danh mục đã được tạo thành công!', // Thông báo thành công
                'data' => $category
            ], 201);// Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
             // Trường hợp có lỗi xảy ra khi tạo Danh mục
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status'=>500
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function update(CategoryUpdateRequest $request ,$id)
    {
        try {
              // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để cập nhật Danh mục
            $category = $this->categoryService->update($id,$data);

            return response()->json([
                'message' => 'Danh mục đã được sửa thành công!', // Thông báo thành công
                'data' => $data,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi cập nhật Danh mục
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(),
                'status'=>500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function destroy($id)
    {

        try {
            // Gọi service để xóa Danh mục
            $atr = $this->categoryService->delete($id);
            return response()->json([
                'message' => 'Danh mục đã được xóa',
                'data' => $atr,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
               // Trường hợp có lỗi xảy ra khi xóa Danh mục
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()  // Lỗi cụ thể
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function show($id)
    {

        try {
                 // Gọi service để lấy thông tin chi tiết Danh mục
            $atr = $this->categoryService->show($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $atr,// Dữ liệu Danh mục chi tiết
                'status'=>200 // Trả về mã trạng thái 200 (OK)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function indexNoPagination(){
        try {
             // Gọi service để lấy dữ liệu
            $categories = $this->categoryService->getAll();
            return response()->json([
                'status' => 200,
                'data' => $categories, // Trả về dữ liệu Danh mục
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
}
