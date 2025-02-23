<?php

namespace App\Services;

use Exception;
use App\Models\Admin;
use App\Models\RoleHistory;
use Illuminate\Database\QueryException;

class AdminService extends BaseService
{
    /**
     * Khởi tạo service với model Admin
     */
    public function __construct(Admin $model)
    {
        parent::__construct($model);
    }

    /**
     * Lấy danh sách admin kèm roles và phân trang
     * Kế thừa getAll từ BaseService và thêm relationship
     */
    public function getAdminsWithRoles($perPage = null)
    {
        try {
            // Load relationships: roles, activities, loginHistory
            $query = $this->model->with(['roles', 'activities', 'loginHistory']);

            // Phân trang nếu có $perPage, không thì lấy tất cả
            return $perPage ? $query->paginate($perPage) : $query->get();
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi lấy danh sách admin: " . $e->getMessage());
        }
    }

    /**
     * Tạo admin mới và gán role
     * Log hoạt động tạo admin
     */
    public function createAdminWithRole(array $data)
    {
        try {
            // Tạo admin mới từ BaseService
            $admin = $this->create($data);

            // Gán role cho admin
            $admin->assignRole($data['role']);

            // Log lại hoạt động tạo admin
            $admin->activities()->create([
                'action' => 'create',
                'entity_type' => 'Admin',
                'entity_id' => $admin->id,
                'new_values' => $data,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Trả về admin với roles đã load
            return $admin->load('roles');
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi tạo admin: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật thông tin admin và role
     * Log thay đổi role và thông tin
     */
    public function updateAdminWithRole($id, array $data)
    {
        try {
            // Lấy admin cần update
            $admin = $this->show($id);

            // Lưu data cũ để log
            $oldData = $admin->toArray();
            $oldRoles = $admin->roles->pluck('name');

            // Update thông tin từ BaseService
            $this->update($id, $data);

            // Nếu có thay đổi role
            if (isset($data['role'])) {
                // Sync role mới
                $admin->syncRoles($data['role']);

                // Log lịch sử thay đổi role
                RoleHistory::create([
                    'admin_id' => $admin->id,
                    'old_roles' => $oldRoles,
                    'new_roles' => [$data['role']],
                    'changed_by' => auth()->id(),
                    'reason' => $data['reason'] ?? 'Cập nhật role'
                ]);
            }

            // Log hoạt động update
            $admin->activities()->create([
                'action' => 'update',
                'entity_type' => 'Admin',
                'entity_id' => $admin->id,
                'old_values' => $oldData,
                'new_values' => $data,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Trả về admin đã refresh với roles
            return $admin->fresh()->load('roles');
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi cập nhật admin: " . $e->getMessage());
        }
    }

    /**
     * Xóa admin và cleanup related data
     * Log lại hoạt động xóa
     */
    public function deleteAdmin($id)
    {
        try {
            // Lấy thông tin admin trước khi xóa
            $admin = $this->show($id);
            $oldData = $admin->toArray();

            // Lấy admin đang thực hiện
            $currentAdmin = auth()->guard('admin')->user();

            // Log hoạt động xóa
            $admin->activities()->create([
                'action' => 'delete',
                'entity_type' => 'Admin',
                'entity_id' => $admin->id,
                'old_values' => $oldData,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Xóa roles của admin
            $admin->roles()->detach();

            // Soft delete admin (vì đã setup SoftDeletes)
            return $this->delete($id);
        } catch (QueryException $e) {
            throw new Exception("Lỗi khi xóa admin: " . $e->getMessage());
        }
    }
}
