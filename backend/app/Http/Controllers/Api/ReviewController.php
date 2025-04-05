<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ReviewStoreRequest;
use App\Http\Requests\Review\ReviewUpdateRequest;
use App\Services\ReviewService;
use \Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Database\QueryException;


class ReviewController extends Controller
{
     // Khai báo service xử lý logic nghiệp vụ liên quan đến Đánh giá
    protected $reviewService;
    // Constructor để khởi tạo service
    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    // Lấy danh sách tất cả Đánh giá
    public function getByProduct($id){
        try {
             // Gọi service để lấy dữ liệu
            $reviews = $this->reviewService->getByProduct($id);
            return response()->json([
                'status' => 200,
                'data' => $reviews, // Trả về dữ liệu Đánh giá
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    // Lấy danh sách tất cả Đánh giá
    public function index(){
        try {
             // Gọi service để lấy dữ liệu
            $reviews = $this->reviewService->getReviews();
            return response()->json([
                'status' => 200,
                'data' => $reviews, // Trả về dữ liệu Đánh giá
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    public function store(ReviewStoreRequest $request)
    {
        try {

             // Validate và lấy dữ liệu từ request
            $data = $request->validated();

            // lấy user_id của user đang đăng nhập
            $data['user_id'] = Auth::id() ?? 1;

             // Gọi service để tạo mới Đánh giá
            $review = $this->reviewService->create($data);

            return response()->json([
                'message' => 'Đánh giá đã được tạo thành công!', // Thông báo thành công
                'data' => $review
            ], 201);// Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
             // Trường hợp có lỗi xảy ra khi tạo Đánh giá
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status'=>500
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function update(ReviewUpdateRequest $request ,$id)
    {
        try {
            $request->merge([
                'user_id' => auth()->id(),
            ]);

              // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để cập nhật Đánh giá
            $review = $this->reviewService->update($id,$data);

            return response()->json([
                'message' => 'Đánh giá đã được sửa thành công!', // Thông báo thành công
                'data' => $data,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi cập nhật Đánh giá
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
            // Gọi service để xóa Đánh giá
            $atr = $this->reviewService->delete($id);
            return response()->json([
                'message' => 'Đánh giá đã được xóa',
                'data' => $atr,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
               // Trường hợp có lỗi xảy ra khi xóa Đánh giá
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()  // Lỗi cụ thể
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function show($id)
    {
        try {
                 // Gọi service để lấy thông tin chi tiết Đánh giá
            $atr = $this->reviewService->show($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $atr,// Dữ liệu Đánh giá chi tiết
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
