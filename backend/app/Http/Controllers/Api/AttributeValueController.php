<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attribute\AttributeValueStoreRequest;
use App\Http\Requests\Attribute\AttributeValueUpdateRequest;
use App\Services\Attribute\AttributeValueService;
use Exception;
use Illuminate\Support\Facades\DB;

class AttributeValueController extends Controller
{
    protected $attributeValueService;

    public function __construct(AttributeValueService $attributeValueService)
    {
        $this->attributeValueService = $attributeValueService;
    }

    /**
     * Lấy danh sách giá trị của một thuộc tính
     */
    public function index($attributeId)
    {
        try {
            $values = $this->attributeValueService->getAll(['attribute_id' => $attributeId]);
            return response()->json([
                'message' => 'Lấy danh sách giá trị thuộc tính thành công',
                'data' => $values,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Lưu giá trị thuộc tính mới
     */
    public function store(AttributeValueStoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $value = $this->attributeValueService->create($data);

            DB::commit();
            return response()->json([
                'message' => 'Giá trị thuộc tính đã được tạo thành công',
                'data' => $value,
                'status' => 201
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi tạo giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Hiển thị thông tin chi tiết của giá trị thuộc tính
     */
    public function show($id)
    {
        try {
            $value = $this->attributeValueService->find($id);
            
            if (!$value) {
                return response()->json([
                    'message' => 'Không tìm thấy giá trị thuộc tính',
                    'status' => 404
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy thông tin giá trị thuộc tính thành công',
                'data' => $value,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy thông tin giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin giá trị thuộc tính
     */
    public function update(AttributeValueUpdateRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $value = $this->attributeValueService->update($id, $data);

            DB::commit();
            return response()->json([
                'message' => 'Giá trị thuộc tính đã được cập nhật thành công',
                'data' => $value,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi cập nhật giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Xóa mềm giá trị thuộc tính
     */
    public function destroy($id)
    {
        try {
            $this->attributeValueService->delete($id);
            return response()->json([
                'message' => 'Giá trị thuộc tính đã được xóa thành công',
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xóa giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Lấy danh sách giá trị thuộc tính đã xóa mềm
     */
    public function trashed($attributeId = null)
    {
        try {
            $filters = $attributeId ? ['attribute_id' => $attributeId] : [];
            $values = $this->attributeValueService->getTrashed($filters);
            return response()->json([
                'message' => 'Lấy danh sách giá trị thuộc tính đã xóa thành công',
                'data' => $values,
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách giá trị thuộc tính đã xóa',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Khôi phục giá trị thuộc tính đã xóa mềm
     */
    public function restore($id)
    {
        try {
            $this->attributeValueService->restore($id);
            return response()->json([
                'message' => 'Khôi phục giá trị thuộc tính thành công',
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi khôi phục giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Xóa hoàn toàn giá trị thuộc tính
     */
    public function forceDelete($id)
    {
        try {
            $this->attributeValueService->delete($id, true);
            return response()->json([
                'message' => 'Xóa hoàn toàn giá trị thuộc tính thành công',
                'status' => 200
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xóa hoàn toàn giá trị thuộc tính',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }
}
