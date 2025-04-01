<?php

namespace App\Http\Controllers\Api\Profile\V1;

use App\Models\Admin;
use Illuminate\Http\Request;
use App\Models\AdminActivity;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class AdminProfileController extends Controller
{
    /**
     * Get customer profile
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            $admin = Admin::where('user_id', $user->id)->first();
            return response()->json([
                'success' => true,
                'message' => 'Thông tin khách hàng',
                'data' => $admin,
                'code' => 200
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống',
                'data' => $th->getMessage(),
                'code' => 500
            ]);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            // Lấy thông tin người dùng đã xác thực
            $user = $request->user();
            
            // Tìm thông tin admin liên kết với user này
            $admin = Admin::where('user_id', $user->id)->first();
            
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thông tin quản trị viên',
                    'code' => 404
                ], 404);
            }
            
            // Xác thực dữ liệu đầu vào
            $validator = Validator::make($request->all(), [
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors(),
                    'code' => 422
                ], 422);
            }
            
            // Lưu giá trị cũ trước khi cập nhật
            $oldValues = $admin->only([
                'first_name',
                'last_name',
                'position',
                'department'
            ]);
            
            // Cập nhật thông tin admin với các trường đã xác thực
            $admin->fill($request->only([
                'first_name',
                'last_name',
                'position',
                'department'
            ]));
            
            // Xác định những trường thực sự thay đổi
            $changedFields = [];
            $changedOldValues = [];
            $changedNewValues = [];

            foreach ($request->only(['first_name', 'last_name', 'position', 'department']) as $field => $value) {
                if (isset($value) && $oldValues[$field] !== $value) {
                    $changedFields[] = $field;
                    $changedOldValues[$field] = $oldValues[$field];
                    $changedNewValues[$field] = $value;
                }
            }
            
            // Cập nhật trường updated_by với ID của người đang thực hiện cập nhật
            $admin->updated_by = $user->id;
            
            // Lưu thông tin đã cập nhật
            $admin->save();
            
            // Chỉ ghi log nếu có thay đổi
            if (!empty($changedFields)) {
                // Ghi lại hoạt động vào bảng admin_activities
                AdminActivity::create([
                    'admin_id' => $admin->id,
                    'action' => 'update',
                    'module' => 'admin_profile',
                    'entity_type' => 'Admin',
                    'entity_id' => $admin->id,
                    'old_values' => $changedOldValues,
                    'new_values' => $changedNewValues,
                    'context' => 'Admin updated their profile fields: ' . implode(', ', $changedFields),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin quản trị viên thành công',
                'data' => $admin,
                'code' => 200
            ]);
        } catch (\Throwable $th) {
            \Illuminate\Support\Facades\Log::error('Lỗi cập nhật thông tin quản trị viên: ' . $th->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi cập nhật thông tin',
                'error' => $th->getMessage(),
                'code' => 500
            ], 500);
        }
    }
}
