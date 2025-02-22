Các bảng dữ liệu cho hệ thống quản trị:

BẢNG ADMINS (Quản lý tài khoản admin)
admins
- id: Khoá chính
- name: Tên người dùng
- email: Email đăng nhập (unique, index)
- password: Mật khẩu đã hash
- position: Chức vụ
- department: Phòng ban
- status: Trạng thái (active/inactive/blocked)
- failed_login_attempts: Đếm số lần đăng nhập sai
- last_login_at: Thời điểm đăng nhập gần nhất
- last_login_ip: IP đăng nhập gần nhất
- created_by: Người tạo tài khoản
- updated_by: Người cập nhật gần nhất
- deleted_at: Soft delete
- timestamps: Thời gian tạo và cập nhật

BẢNG ADMIN_ACTIVITIES (Log hoạt động)
admin_activities
- id: Khoá chính
- admin_id: ID người thực hiện
- action: Hành động thực hiện
- module: Module tác động (products, orders, admins...)
- entity_type: Loại đối tượng tác động
- entity_id: ID đối tượng tác động
- old_values: Giá trị trước khi thay đổi (JSON)
- new_values: Giá trị sau khi thay đổi (JSON)
- ip_address: IP thực hiện
- user_agent: Thông tin trình duyệt
- timestamps: Thời gian tạo và cập nhật

BẢNG ADMIN_LOGIN_HISTORY (Log đăng nhập)
admin_login_history
- id: Khoá chính
- admin_id: ID admin
- ip_address: IP đăng nhập
- user_agent: Thông tin trình duyệt
- status: Trạng thái (success/failed)
- login_at: Thời điểm đăng nhập

BẢNG ROLE_HISTORY (Lịch sử thay đổi quyền)
role_history
- id: Khoá chính
- admin_id: ID người được thay đổi
- changed_by: ID người thực hiện thay đổi
- old_roles: Quyền cũ (JSON)
- new_roles: Quyền mới (JSON)
- reason: Lý do thay đổi
- timestamps: Thời gian tạo và cập nhật

Giải thích các loại tokens trong Laravel Passport:

Access Token:
- Token chính để xác thực API requests
- Thời gian sống ngắn (15 ngày)
- Gửi qua header: Authorization: Bearer {token}
- Được tạo khi admin login thành công

Personal Access Token:
- Token dài hạn cho các ứng dụng first-party
- Admin có thể tự tạo và quản lý
- Thường dùng cho các tools, scripts tự động
- Không cần refresh token
- Có thể set scopes và permissions riêng

Refresh Token:
- Dùng để lấy access token mới khi hết hạn
- Thời gian sống dài hơn (30 ngày)
- Tăng bảo mật vì access token ngắn hạn
- Flow:
  + Access token hết hạn
  + Dùng refresh token để lấy access token mới
  + Refresh token cũ bị vô hiệu hóa

Trong project này:
- Login API trả về access token
- Admin dùng token này để gọi các protected APIs
- Token tự động hết hạn sau 15 ngày
- Có thể refresh để kéo dài phiên đăng nhập

Resource files trong Laravel có mục đích:
1.Chuyển đổi Model thành JSON response:
    return new AdminResource($admin);
    // Thay vì return $admin->toArray();
2.Kiểm soát dữ liệu trả về:
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'position' => $this->position,
        'department' => $this->department,
        'status' => $this->status,
        'last_login_at' => $this->last_login_at,
        // Không trả về password và các field nhạy cảm
    ];
}
3.Format dữ liệu:
    Chuẩn hóa định dạng ngày giờ
    Transform relationships
    Thêm computed fields
    Conditional fields dựa theo permissions
4.Tái sử dụng và nhất quán:
    Dùng chung cho nhiều endpoints
    Đảm bảo format API thống nhất
    Dễ maintain và mở rộng

Cách viết firstOrCreate với 2 tham số có ý nghĩa:

1.Tham số thứ nhất ['email' => 'superadmin@example.com']:
    Là điều kiện tìm kiếm (where clause)
    Email là unique key để xác định admin
    Kiểm tra xem admin với email này đã tồn tại chưa
2.Tham số thứ hai là mảng thông tin còn lại:
    Chỉ được sử dụng khi tạo mới
    Chứa các field khác của admin
    Không update nếu record đã tồn tại
3.Flow hoạt động:

    // Tương đương với:
    $admin = Admin::where('email', 'superadmin@example.com')->first();

    if (!$admin) {
        $admin = Admin::create([
            'email' => 'superadmin@example.com',
            'name' => 'Super Admin',
            'password' => Hash::make('super@admin123'),
            // ...các field khác
        ]);
    }

    $admin->assignRole('super_admin');

4.Ưu điểm:

    Code ngắn gọn, rõ ràng
    Tránh duplicate admin accounts
    Bảo toàn dữ liệu hiện có
    An toàn khi chạy seeder nhiều lần

Code Run
php artisan migrate:fresh
php artisan passport:install --force
php artisan db:seed --class=RoleAndPermissionSeeder
php artisan db:seed --class=AdminSeeder