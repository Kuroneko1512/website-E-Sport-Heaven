<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Models\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\V1\AdminResource;

class AdminController extends Controller
{
    /**
     * Format response API
     * 
     * @param bool $success Trạng thái thành công
     * @param string $message Thông báo
     * @param array $data Dữ liệu trả về
     * @param int $code HTTP status code
     */
    private function responseJson($success, $message = '', $data = [], $code = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ], $code);
    }
    /**
     * Lấy danh sách admin có phân trang
     * Load thêm thông tin roles của admin
     */
    public function index()
    {
        $admins = Admin::with('roles')->paginate(10);
        return $this->responseJson(
            true,
            'Lấy danh sách admin thành công',
            AdminResource::collection($admins)
        );
    }

    /**
     * Tạo mới tài khoản admin
     * Gán role cho admin mới
     */
    public function store(Request $request)
    {
        $admin = Admin::create($request->validated());
        $admin->assignRole($request->role);

        return $this->responseJson(
            true,
            'Tạo tài khoản admin thành công',
            new AdminResource($admin)
        );
    }

    /**
     * Xem chi tiết thông tin một admin
     */
    public function show(string $id)
    {
        $admin = Admin::with('roles')->findOrFail($id);
        return $this->responseJson(
            true,
            'Lấy thông tin admin thành công',
            new AdminResource($admin)
        );
    }

    /**
     * Cập nhật thông tin admin
     * Cập nhật role nếu có thay đổi
     */
    public function update(Request $request, string $id)
    {
        $admin->update($request->validated());

        if ($request->role) {
            $admin->syncRoles($request->role);
        }

        return $this->responseJson(
            true,
            'Cập nhật thông tin admin thành công',
            new AdminResource($admin)
        );
    }

    /**
     * Xóa tài khoản admin
     */
    public function destroy(string $id)
    {
        $admin->delete();
        return $this->responseJson(true, 'Xóa tài khoản admin thành công');
    }
}
