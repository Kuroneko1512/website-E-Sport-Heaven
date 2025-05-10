<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Attribute\AttributeService;
use App\Http\Requests\Attribute\AttributeStoreRequest;
use App\Http\Requests\Attribute\AttributeUpdateRequest;
use Exception;
class AttributeController extends Controller
{
    protected $attributeService ;
    // Constructor để khởi tạo service
    public function __construct(AttributeService $attributeService)
    {
        $this->attributeService = $attributeService;
    }
    // Lấy danh sách tất cả thuộc tính
    public function index(){
        try {
             // Gọi service để lấy dữ liệu
            $atr = $this->attributeService->getAttributes();
            return response()->json([
                'status' => 200,
                'data' => $atr, // Trả về dữ liệu thuộc tính
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function getAttributeForIds(Request $request){
        $data = $request->all();
        try {
             // Gọi service để lấy dữ liệu
            $atr = $this->attributeService->getAttributesForId($data['attribute_ids']);
            return response()->json([
                'status' => 200,
                'data' => $atr, // Trả về dữ liệu thuộc tính
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
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
            ], 201);// Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
             // Trường hợp có lỗi xảy ra khi tạo thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status'=>500
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function update(AttributeUpdateRequest $request ,$id)
    {
        try {
              // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để cập nhật thuộc tính
            $attribute = $this->attributeService->update($id,$data);

            return response()->json([
                'message' => 'Thuộc tính đã được sửa thành công!', // Thông báo thành công
                'data' => $data,
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
    public function destroy($id)
    {
       
        try {
            // Gọi service để xóa thuộc tính
            $atr = $this->attributeService->delete($id);
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
    public function show($id)
    {
       
        try {
                 // Gọi service để lấy thông tin chi tiết thuộc tính
            $atr = $this->attributeService->show($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $atr,// Dữ liệu thuộc tính chi tiết
                'status'=>200 // Trả về mã trạng thái 200 (OK)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
