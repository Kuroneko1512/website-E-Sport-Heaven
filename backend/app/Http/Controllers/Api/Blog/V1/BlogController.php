<?php

namespace App\Http\Controllers\Api\Blog\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\BlogStoreRequest;
use App\Http\Requests\Blog\BlogUpdateRequest;
use App\Services\Blog\BlogService;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BlogController extends Controller
{
    protected $blogService;
    protected $mediaService;

    // Constructor để khởi tạo service
    public function __construct(BlogService $blogService, \App\Services\Media\MediaService $mediaService)
    {
        $this->blogService = $blogService;
        $this->mediaService = $mediaService;
    }
    // Upload ảnh cho Quill editor
    // public function uploadImage(Request $request): JsonResponse
    // {
    //     try {
    //         // Kiểm tra xem request có gửi file ảnh với tên "image" hay không
    //         if (!$request->hasFile('image')) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Không tìm thấy file ảnh'
    //             ], 400);
    //         }

    //         // Lấy file ảnh từ request
    //         $image = $request->file('image');
    //         // Gọi service để xử lý ảnh (resize, đổi tên, lưu trữ...) và lưu vào thư mục "blog"
    //         $result = $this->mediaService->processImage($image, 'blog');

    //         // Trả về kết quả thành công, bao gồm đường dẫn ảnh đã upload
    //         return response()->json([
    //             'success' => true,
    //             'url' => $result['url']
    //         ]);
    //     } catch (Exception $e) {
    //         // Nếu có lỗi xảy ra trong quá trình xử lý ảnh thì trả về lỗi và thông báo lỗi
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi tải ảnh lên: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    // Lấy danh sách tất cả bài viết blog
    public function index(Request $request): JsonResponse
    {
        Log::info('Request index data: '. json_encode($request->all()));
        try {
            $blogs = $this->blogService->getBlogs($request);
            return response()->json([
                'success' => true,
                'data' => $blogs
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' =>  'Lỗi khi lấy bài viết blog: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Tạo mới bài viết blog
    // public function store(BlogStoreRequest $request): JsonResponse
    // {
    //     Log::info('Request store data: '. json_encode($request->all()));
    //     try {
    //         // $data['user_id'] = auth()->id(); // Gán user_id từ user đang đăng nhập
    //         $data = $request->validated();
    //         $blog = $this->blogService->createBlog($data);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Bài viết blog đã được tạo thành công!',
    //             'data' => $blog
    //         ], 201);
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'success' => false, 
    //             'message' => 'Lỗi khi tạo bài viết blog: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // // Cập nhật bài viết blog
    // public function update(BlogUpdateRequest $request, $id): JsonResponse
    // {
    //     try {
    //         Log::error('Request data: '. json_encode($request->all()));
    //         $data = $request->validated();
    //         $blog = $this->blogService->updateBlog($id, $data);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Bài viết blog đã được cập nhật thành công!',
    //             'data' => $blog
    //         ], 200);
    //     } catch (Exception $e) {
    //         $statusCode = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 500;
    //         return response()->json([
    //             'success' => false, 
    //             'message' => 'Lỗi khi cập nhật bài viết blog: ' . $e->getMessage(),
    //         ], $statusCode);
    //     }
    // }

    // // Xóa bài viết blog
    // public function destroy($id): JsonResponse
    // {
    //     try {
    //         $this->blogService->deleteBlog($id);
    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Bài viết blog đã được xóa thành công!'
    //         ]);
    //     } catch (Exception $e) {
    //         $statusCode = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 500;
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi xóa bài viết blog: ' . $e->getMessage(),
    //         ], $statusCode);
    //     }
    // }

    // // Lấy thông tin chi tiết bài viết blog
    // public function show($id): JsonResponse
    // {
    //     try {
    //         $blog = $this->blogService->findBlog($id);
    //         return response()->json([
    //             'success' => true,
    //             'data' => $blog
    //         ], 200);
    //     } catch (Exception $e) {
    //         $statusCode = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 500;
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi lấy thông tin bài viết blog: ' . $e->getMessage(),
    //         ], $statusCode);
    //     }
    // }

    // // Get blog by slug
    // public function getSlug($slug): JsonResponse
    // {
    //     try {
    //         $blog = $this->blogService->findBySlug($slug);
    //         return response()->json([
    //             'success' => true,
    //             'data' => $blog
    //         ]);
    //     } catch (Exception $e) {
    //         $statusCode = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 500;
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Lỗi khi lấy thông tin bài viết blog: ' . $e->getMessage()
    //         ], $statusCode);
    //     }
    // }
}
