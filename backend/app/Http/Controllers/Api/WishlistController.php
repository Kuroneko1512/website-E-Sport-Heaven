<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Http\Requests\Wishlist\WishlistStoreRequest;
use App\Services\WishlistService;
use \Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Database\QueryException;


class WishlistController extends Controller
{
     // Khai báo service xử lý logic nghiệp vụ liên quan đến Wishlist
    protected $wishlistService;
    // Constructor để khởi tạo service
    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    // Lấy Wishlist
    public function getByProduct($id){
        try {
             // Gọi service để lấy dữ liệu
            $wishlist = $this->wishlistService->getItemWishlist(auth()->id(), $id);
            return response()->json([
                'status' => 200,
                'data' => $wishlist != null, // Trả về dữ liệu Wishlist
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    // New method to get wishlist status for multiple products
    public function getByProducts(){
        try {
            $productIds = request()->input('product_ids', []);
            if (!is_array($productIds) || empty($productIds)) {
                return response()->json([
                    'status' => 400,
                    'message' => 'product_ids phải là một mảng không rỗng'
                ], 400);
            }
            $wishlistStatuses = $this->wishlistService->getItemsWishlist(auth()->id(), $productIds);
            return response()->json([
                'status' => 200,
                'data' => $wishlistStatuses,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Lấy thất bại',
                'status' => 500
            ], 500);
        }
    }

    // Lấy danh sách tất cả Wishlist
    public function index(){
        try {
             // Gọi service để lấy dữ liệu
            $wishlists = $this->wishlistService->getWishlists(auth()->id());
            return response()->json([
                'status' => 200,
                'data' => $wishlists, // Trả về dữ liệu Wishlist
            ],200);
        } catch (\Throwable $th) {
             // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'status'=>200
            ],500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    public function store(WishlistStoreRequest $request)
    {
        try {

             // Validate và lấy dữ liệu từ request
             $request->merge([
                'user_id' => auth()->id(),
            ]);

            $data = $request->validated();
            $wishlist = null;
            $existedWishlist = $this->wishlistService->getItemWishlist(auth()->id(), $data['product_id']);

            if ($existedWishlist == null) {
                $wishlist = $this->wishlistService->create($data);
            } else {
                $this->wishlistService->delete($existedWishlist['id']);
            }

            return response()->json([
                'message' => 'Wishlist đã được cập nhập thành công!', // Thông báo thành công
                'data' => $wishlist
            ], 201);// Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
             // Trường hợp có lỗi xảy ra khi tạo Wishlist
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status'=>500
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function update(WishlistStoreRequest $request ,$id)
    {
        try {
            $request->merge([
                'user_id' => auth()->id(),
            ]);

              // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            // Gọi service để cập nhật Wishlist
            $wishlist = $this->wishlistService->update($id,$data);

            return response()->json([
                'message' => 'Wishlist đã được sửa thành công!', // Thông báo thành công
                'data' => $data,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
            // Trường hợp có lỗi xảy ra khi cập nhật Wishlist
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
            // Gọi service để xóa Wishlist
            $atr = $this->wishlistService->delete($id);
            return response()->json([
                'message' => 'Wishlist đã được xóa',
                'data' => $atr,
                'status'=>200
            ], 200);// Trả về mã trạng thái 200 (OK)

        } catch (Exception $e) {
               // Trường hợp có lỗi xảy ra khi xóa Wishlist
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()  // Lỗi cụ thể
            ], 500);// Trả về mã lỗi 500 (Internal Server Error)
        }
    }

    public function show($id)
    {
        try {
                 // Gọi service để lấy thông tin chi tiết Wishlist
            $atr = $this->wishlistService->show($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $atr,// Dữ liệu Wishlist chi tiết
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
