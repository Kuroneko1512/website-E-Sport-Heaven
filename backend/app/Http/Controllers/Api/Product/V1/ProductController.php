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
                'mess' => $th,
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
        DB::beginTransaction();
        try {
            $data = $request->validated();

            // return response()->json($data['variants']);

            // Cập nhật thông tin sản phẩm
            $product = $this->productService->updateProduct($data, $id); // Gọi service để cập nhật

            // Kiểm tra xem có sản phẩm nào được cập nhật không
            if (!$product) {
                return response()->json([
                    'message' => 'Product not found',
                    'status' => 404
                ], 404);
            }

            DB::commit();
            // Trả về phản hồi thành công với thông tin sản phẩm đã được cập nhật
            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            // Xử lý lỗi nếu có
            return response()->json([
                'message' => 'Error while processing data.',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
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
                'status' => 200
            ], 200); // Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi xóa thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()  // Lỗi cụ thể
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function searchProducts(Request $request)
    {

        $request->validate([
            'q' => 'required|string|min:1',
        ]);

        $products = $this->productService->searchProduct($request->q, $request->paginate ?? 12);

        return response()->json(
            [
                'success' => true,
                'data' => $products,
            ],
            200
        );
    }
    public function getProductFillterAll(Request $request)
    {
        $filters = [
            'category_id' => $request->input('category_id'),
            'min_price'   => $request->input('min_price'),
            'max_price'   => $request->input('max_price'),
            'attributes'  => is_string($request->input('attributes'))
                ? explode(',', $request->input('attributes'))
                : [],
        ];

        $products = $this->productService->getProductFiterAll($filters, $request->paginate ?? 12);

        return response()->json([
            'success' => true,
            'data' => $products,
        ], 200);
    }

    public function getPriceRange()
    {
        try {
            $priceRange = $this->productService->getPriceRange();
            return response()->json([
                'success' => true,
                'data' => $priceRange
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
