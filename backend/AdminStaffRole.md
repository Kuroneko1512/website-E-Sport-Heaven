Các bảng dữ liệu cho hệ thống quản trị:

BẢNG ADMINS (Quản lý tài khoản admin/staff)
admins
- id: Khóa chính
- name: Tên người dùng
- email: Email đăng nhập (unique, index)
- password: Mật khẩu đã hash
- type: Phân loại tài khoản (super_admin/admin/staff)
- position: Chức vụ
- department: Phòng ban
- status: Trạng thái (active/inactive/blocked)
- failed_login_attempts: Đếm số lần đăng nhập sai
- last_login_at: Thời điểm đăng nhập gần nhất
- last_login_ip: IP đăng nhập gần nhất
- password_changed_at: Thời điểm đổi mật khẩu gần nhất
- force_password_change: Cờ bắt buộc đổi mật khẩu
- email_verified_at: Thời điểm xác thực email
- remember_token: Token ghi nhớ đăng nhập
- deleted_at: Soft delete
- created_by: Người tạo tài khoản
- updated_by: Người cập nhật gần nhất


BẢNG ADMIN_PASSWORD_RESETS (Quản lý reset mật khẩu)
admin_password_resets
- id: Khóa chính
- email: Email yêu cầu reset
- token: Token reset (có thời hạn)
- created_at: Thời điểm tạo yêu cầu
- expires_at: Thời điểm hết hạn
- used_at: Thời điểm sử dụng token
- created_by: Người tạo yêu cầu reset


BẢNG ADMIN_ACTIVITIES (Log hoạt động)
admin_activities
- id: Khóa chính
- admin_id: ID người thực hiện
- action: Hành động thực hiện
- entity_type: Loại đối tượng tác động
- entity_id: ID đối tượng tác động
- old_values: Giá trị trước khi thay đổi (JSON)
- new_values: Giá trị sau khi thay đổi (JSON)
- ip_address: IP thực hiện
- user_agent: Thông tin trình duyệt


BẢNG ADMIN_SESSIONS (Quản lý phiên đăng nhập)
admin_sessions
- id: Khóa chính
- admin_id: ID người dùng
- ip_address: IP đăng nhập
- user_agent: Thông tin trình duyệt
- payload: Dữ liệu phiên (JSON)
- last_activity: Hoạt động cuối cùng


BẢNG ROLES (Vai trò/Chức vụ)
roles
- id: Khóa chính
- name: Tên vai trò
- guard_name: Tên guard sử dụng
- description: Mô tả vai trò


BẢNG PERMISSIONS (Quyền hạn)
permissions
- id: Khóa chính
- name: Tên quyền
- guard_name: Tên guard sử dụng
- description: Mô tả quyền


BẢNG ROLE_HAS_PERMISSIONS (Liên kết vai trò-quyền)
role_has_permissions
- permission_id: ID quyền
- role_id: ID vai trò


BẢNG MODEL_HAS_ROLES (Gán vai trò cho admin)
model_has_roles
- role_id: ID vai trò
- model_type: Loại model
- model_id: ID của admin


BẢNG ROLE_HISTORY (Lịch sử thay đổi quyền)
role_history
- id: Khóa chính
- admin_id: ID người được thay đổi
- old_roles: Quyền cũ (JSON)
- new_roles: Quyền mới (JSON)
- changed_by: ID người thực hiện thay đổi
- reason: Lý do thay đổi


Tất cả các bảng đều có timestamps để theo dõi thời gian tạo và cập nhật.