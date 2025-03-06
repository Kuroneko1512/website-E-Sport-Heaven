<?php

namespace App\Http\Controllers\Api\Blog\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\BlogStoreRequest;
use App\Http\Requests\Blog\BlogUpdateRequest;
use App\Services\Blog\BlogService;
use Illuminate\Support\Str;
use Exception;

class BlogController extends Controller
{
    protected $blogService;

    // Constructor để khởi tạo service
    public function __construct(BlogService $blogService)
    {
        $this->blogService = $blogService;
    }

    // Lấy danh sách tất cả bài viết blog
    public function index()
    {
        try {
            $blogs = $this->blogService->getBlogs();
            return response()->json([
                'status' => 200,
                'data' => $blogs
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy bài viết blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Tạo mới bài viết blog
    public function store(BlogStoreRequest $request)
    {
        try {
            // $data['user_id'] = auth()->id(); // Gán user_id từ user đang đăng nhập
            $data = $request->validated();
            $data['slug'] = Str::slug($data['title']); // Tạo slug tự động
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $path = $file->store('thumbnails', 'public');
                $data['thumbnail'] = $path;
            }
            $blog = $this->blogService->create($data);

            return response()->json([
                'message' => 'Bài viết blog đã được tạo thành công!',
                'data' => $blog
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi tạo bài viết blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Cập nhật bài viết blog
    public function update(BlogUpdateRequest $request, $id)
    {
        try {
            // Kiểm tra bài viết có tồn tại không
            $blog = $this->blogService->findBlog($id);
            if (!$blog) {
                return response()->json([
                    'error' => 'Bài viết blog không tồn tại!',
                ], 404);
            }
            $data = $request->validated();
            // Nếu title thay đổi thì cập nhật slug
            if (isset($data['title']) && $data['title'] !== $blog->title) {
                $data['slug'] = Str::slug($data['title']);
            }
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $path = $file->store('thumbnails', 'public');
                $data['thumbnail'] = $path;
            }

            $blog = $this->blogService->update($id, $data);

            return response()->json([
                'message' => 'Bài viết blog đã được cập nhật thành công!',
                'data' => $blog
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi cập nhật bài viết blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Xóa bài viết blog
    public function destroy($id)
    {
        try {
            $this->blogService->delete($id);
            return response()->json([
                'message' => 'Bài viết blog đã được xóa thành công!'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi xóa bài viết blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Lấy thông tin chi tiết bài viết blog
    public function show($id)
    {
        try {
            $blog = $this->blogService->findBlog($id);
            return response()->json([
                'status' => 200,
                'data' => $blog
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy thông tin bài viết blog.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
