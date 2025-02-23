<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Models\Admin;
use Illuminate\Http\Request;
use App\Services\AdminService;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\V1\AdminResource;
use App\Http\Requests\Api\Admin\V1\Admin\StoreRequest;
use App\Http\Requests\Api\Admin\V1\Admin\UpdateRequest;

class AdminController extends Controller
{
    protected $adminService;

    /**
     * Khởi tạo controller với service và middleware
     * 
     * @param AdminService $adminService
     */
    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
        // Kiểm tra quyền truy cập cho từng action
        $this->middleware('permission:view_admins')->only('index', 'show');
        $this->middleware('permission:create_admins')->only('store');
        $this->middleware('permission:edit_admins')->only('update');
        $this->middleware('permission:delete_admins')->only('destroy');
    }
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
     * Kèm theo danh sách roles cho frontend
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $admins = $this->adminService->getAdminsWithRoles(10);
        return $this->responseJson(
            true,
            'Lấy danh sách admin thành công',
            [
                'admins' => AdminResource::collection($admins),
                'roles' => Role::all()->pluck('name'),
                'pagination' => [
                    'total' => $admins->total(),
                    'per_page' => $admins->perPage(),
                    'current_page' => $admins->currentPage(),
                    'last_page' => $admins->lastPage()
                ]
            ]
        );
    }

    /**
     * Tạo mới tài khoản admin
     * 
     * @param StoreRequest $request Request đã validate
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreRequest $request)
    {
        $admin = $this->adminService->createAdminWithRole($request->validated());
        return $this->responseJson(
            true,
            'Tạo admin thành công',
            [
                'admin' => new AdminResource($admin)
            ]
        );
    }

    /**
     * Xem chi tiết thông tin admin
     * Kèm theo danh sách roles cho form edit
     * 
     * @param Admin $admin Model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Admin $admin)
    {
        $admin = $this->adminService->show($admin->id);
        return $this->responseJson(
            true,
            'Lấy thông tin admin thành công',
            [
                'admin' => new AdminResource($admin),
                'roles' => Role::all()->pluck('name')
            ]
        );
    }

    /**
     * Cập nhật thông tin admin
     * 
     * @param UpdateRequest $request Request đã validate
     * @param Admin $admin Model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateRequest $request, Admin $admin)
    {
        $admin = $this->adminService->updateAdminWithRole($admin->id, $request->validated());
        return $this->responseJson(
            true,
            'Cập nhật admin thành công',
            [
                'admin' => new AdminResource($admin)
            ]
        );
    }

    /**
     * Xóa tài khoản admin
     * 
     * @param Admin $admin Model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Admin $admin)
    {
        $this->adminService->deleteAdmin($admin->id);
        return $this->responseJson(
            true,
            'Xóa admin thành công'
        );
    }
}
