<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttributeStoreRequest;
use App\Http\Requests\AttributeUpdateRequest;
use App\Services\Attribute\AttributeService;
use Exception;
use Illuminate\Database\QueryException;


class AttributeController extends Controller
{
    protected $attributeService ;
    public function __construct(AttributeService $attributeService)
    {
        $this->attributeService = $attributeService;
    }
    public function index(){
        try {
            $atr = $this->attributeService->getAttributes();
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
    public function store(AttributeStoreRequest $request)
    {
       
        try {
            $data = $request->validated();
            $attribute = $this->attributeService->create($data);

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
    public function update(AttributeUpdateRequest $request ,$id)
    {
        try {
            $data = $request->validated();
            $attribute = $this->attributeService->update($id,$data);

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
    public function destroy($id)
    {
       
        try {
            $atr = $this->attributeService->delete($id);
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
    public function show($id)
    {
       
        try {
            $atr = $this->attributeService->show($id);
            return response()->json([
                'message' => 'lấy thành công',
                'data' => $atr,
                'status'=>200
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    

}
