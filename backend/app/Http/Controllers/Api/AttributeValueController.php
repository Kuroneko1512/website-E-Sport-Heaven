<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attribute\AttributeValueStoreRequest;
use App\Http\Requests\Attribute\AttributeValueUpdateRequest;
use App\Services\Attribute\AttributeValueService;
use Exception;
use Illuminate\Http\Request;

class AttributeValueController extends Controller
{
   protected $attributeValueService; 
    public function __construct(AttributeValueService $attributeValueService)
    {
        $this->attributeValueService = $attributeValueService;
    }
    public function store(AttributeValueStoreRequest $request)
    {
       
        try {
            $data = $request->validated();
            $attribute = $this->attributeValueService->create($data);

            return response()->json([
                'message' => 'Thuộc tính đã được tạo thành công!',
                'data' => $attribute
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index($id){
        try {
            $atr = $this->attributeValueService->getAttributeValues($id);
            return response()->json([
                'status' => 200,
                'data' => $atr
            ],200);
        } catch (\Throwable $th) {
            return response()->json([
                'errnor' => 'lấy thất bại'
            ]);
        }
    }
    public function destroy($id)
    {
       
        try {
            $atr = $this->attributeValueService->delete($id);
            return response()->json([
                'message' => 'Thuộc tính đã được xóa',
                'data' => $atr
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function update(AttributeValueUpdateRequest $request ,$id)
    {
        try {
            $data = $request->validated();
            $attribute = $this->attributeValueService->update($id,$data);

            return response()->json([
                'message' => 'Thuộc tính đã được sửa thành công!',
                'data' => $attribute
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
