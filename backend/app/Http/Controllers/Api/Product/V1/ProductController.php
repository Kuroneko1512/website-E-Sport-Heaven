<?php

namespace App\Http\Controllers\Api\Product\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ProductStoreRequest;
use App\Http\Requests\Product\ProductUpdateRequest;
use App\Http\Resources\ProductDetails\ProductResource;
use App\Services\Product\ProductService;
use App\Services\Product\ProductVariantService;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
       
    }
    public function index()
    {
        try {
            // Gọi service để lấy dữ liệu
            $Product = $this->productService->getProductAll();
            return response()->json([
                'status' => 200,
                'data' => $Product, // Trả về dữ liệu thuộc tính
            ], 200);
        } catch (\Throwable $th) {
            // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'mess'=>$th,
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductStoreRequest $request)
    {
     
        DB::beginTransaction();
        try {

            // Validate và lấy dữ liệu từ request
            $data = $request->validated();
             //tạo sp
            $product = $this->productService->createProduct($data);
           
            DB::commit();
            return response()->json([
                'message' => 'Thuộc tính đã được tạo thành công!', // Thông báo thành công
                'data' => $data
            ], 201); // Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
            DB::rollBack();
            // Trường hợp có lỗi xảy ra khi tạo thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $product = $this->productService->getProduct($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $product, // Dữ liệu thuộc tính chi tiết
                'status' => 200 // Trả về mã trạng thái 200 (OK)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function showForDetails(string $id)
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $product = $this->productService->getProductForDetail($id);
            // $att = $this->productService->handelAttribteForDetail($product);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => new ProductResource($product), // Dữ liệu thuộc tính chi tiết
                // 'data' => $product, // Dữ liệu thuộc tính chi tiết
                'status' => 200 // Trả về mã trạng thái 200 (OK)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductUpdateRequest $request, $id)
    {
      
        try {
            // Validate và lấy dữ liệu từ request
          $data = $request->validated();
          
          // Gọi service để cập nhật thuộc tính
          $Product = $this->productService->updateProduct($data,$id);

          return response()->json([
              'message' => 'Thuộc tính đã được sửa thành công!', // Thông báo thành công
              'data' => $Product,
              'status'=>200
          ], 200);// Trả về mã trạng thái 200 (OK)

      } catch (Exception $e) {
          // Trường hợp có lỗi xảy ra khi cập nhật thuộc tính
          return response()->json([
              'message' => 'Lỗi khi xử lý dữ liệu.',
              'error' => $e->getMessage(),
              'status'=>500
          ], 500); // Trả về mã lỗi 500 (Internal Server Error)
      }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Gọi service để xóa thuộc tính
            $atr = $this->productService->delete($id);
            return response()->json([
                'message' => 'Thuộc tính đã được xóa',
                'data' => $atr,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
               // Trường hợp có lỗi xảy ra khi xóa thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()  // Lỗi cụ thể
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
  
}
