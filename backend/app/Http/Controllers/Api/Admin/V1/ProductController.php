<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Product\ProductService;
use App\Http\Requests\Product\ProductStoreRequest;
use App\Http\Requests\Product\ProductUpdateRequest;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        try {
            // Lấy các tham số từ request
            $perPage = $request->input('per_page', 15); // Mặc định 15 sản phẩm/trang
            $searchName = $request->input('search_name', ''); // Tìm kiếm theo tên

            // Gọi service để lấy dữ liệu với các tham số tìm kiếm
            $Product = $this->productService->getProductAll($perPage, $searchName);

            return response()->json([
                'status' => 200,
                'data' => $Product, // Trả về dữ liệu sản phẩm
            ], 200);
        } catch (\Throwable $th) {
            // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'error' => 'Lấy dữ liệu thất bại',
                'message' => $th->getMessage(),
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
    // public function getProductByIdEdit(string $id)
    // {
    //     $product = $this->productService->getProductById($id);
    //     return response()->json([
    //         'message' => 'lấy thành công', // Thông báo thành công
    //         'data' => $product, // Dữ liệu thuộc tính chi tiết
    //         'status' => 200 // Trả về mã trạng thái 200 (OK)
    //     ], 200);
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductUpdateRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            // Log::info('Request data:', [$request->all()]);
            $data = $request->validated();
            // Log::info('Data after validation:', [$data]);
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

    /**
     * Cập nhật trạng thái sản phẩm
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            // Validate dữ liệu đầu vào
            $request->validate([
                'status' => 'required|in:active,inactive',
            ]);

            // Gọi service để cập nhật trạng thái
            $product = $this->productService->updateProductStatus($id, $request->status);

            return response()->json([
                'status' => 200,
                'message' => 'Cập nhật trạng thái sản phẩm thành công',
                'data' => $product,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 404,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Lỗi khi cập nhật trạng thái sản phẩm',
                'error' => $e->getMessage(),
            ], 500);
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
}
