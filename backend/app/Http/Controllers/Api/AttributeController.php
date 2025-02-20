<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Http\Requests\Attribute\AttributeStoreRequest;
use App\Http\Requests\Attribute\AttributeUpdateRequest;
use App\Services\Attribute\AttributeService;
use Exception;
use Illuminate\Database\QueryException;


class AttributeController extends Controller
{
    // Khai báo service xử lý logic nghiệp vụ liên quan đến thuộc tính
    protected $attributeService;
    // Constructor để khởi tạo service
    public function __construct(AttributeService $attributeService)
    {
        $this->attributeService = $attributeService;
    }
    // Lấy danh sách tất cả thuộc tính
    public function index()
    {
        try {
            // Gọi service để lấy dữ liệu
            $atr = $this->attributeService->getAttributes();
            return response()->json([
                'status' => 200,
                'data' => $atr, // Trả về dữ liệu thuộc tính
            ], 200);
        } catch (\Throwable $th) {
            // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'error' => 'lấy thất bại',
                'status' => 200
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    public function store(AttributeStoreRequest $request)
    {

        try {
            // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để tạo mới thuộc tính
            $attribute = $this->attributeService->create($data);

            return response()->json([
                'message' => 'Thuộc tính đã được tạo thành công!', // Thông báo thành công
                'data' => $attribute
            ], 201); // Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi tạo thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function update(AttributeUpdateRequest $request, $id)
    {
        try {
            // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để cập nhật thuộc tính
            $attribute = $this->attributeService->update($id, $data);

            return response()->json([
                'message' => 'Thuộc tính đã được sửa thành công!', // Thông báo thành công
                'data' => $data,
                'status' => 200
            ], 200); // Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi cập nhật thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function destroy($id)
    {

        try {
            // Gọi service để xóa thuộc tính
            $atr = $this->attributeService->delete($id);
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
    public function find($id)
    {

        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $attribute = $this->attributeService->find($id);

            if (!$attribute) {
                return response()->json([
                    'message' => 'Không tìm thấy thuộc tính',
                    'status' => 404
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy thông tin thuộc tính thành công',
                'data' => $attribute,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy thông tin thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Get list of soft deleted attributes
     * Lấy danh sách thuộc tính đã xóa mềm
     */
    public function trashed()
    {
        try {
            $attributes = $this->attributeService->getTrashed();
            return response()->json([
                'status' => 200,
                'data' => $attributes,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Lấy danh sách thất bại',
                'message' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Restore a soft deleted attribute
     * Khôi phục thuộc tính đã xóa mềm
     */
    public function restore($id)
    {
        try {
            $this->attributeService->restore($id);
            return response()->json([
                'status' => 200,
                'message' => 'Khôi phục thuộc tính thành công',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Khôi phục thất bại',
                'message' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Force delete an attribute
     * Xóa hoàn toàn thuộc tính
     */
    public function forceDelete($id)
    {
        try {
            $this->attributeService->delete($id, true);
            return response()->json([
                'status' => 200,
                'message' => 'Xóa thuộc tính thành công',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Xóa thất bại',
                'message' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }
}
