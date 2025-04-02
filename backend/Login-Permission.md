# Database Structure & Authentication System
# Cấu trúc Cơ sở dữ liệu & Hệ thống Xác thực

## 1. Install Required Packages
## 1. Cài đặt Packages cần thiết

```bash
composer require spatie/laravel-permission
composer require laravel/passport
```
- Đối với pull code về sau khi pull cần thực hiện các dòng lệnh sau
```bash
php artisan migrate:fresh
php artisan passport:install --force
```
## 2. Database Tables
## 2. Các bảng Cơ sở dữ liệu

### Users Table (Bảng Người dùng)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- name: string (required) | Tên người dùng (bắt buộc)
- email: string (required, unique) | Email (bắt buộc, duy nhất)
- phone: string (nullable, unique) | Số điện thoại (có thể null, duy nhất)
- email_verified_at: timestamp (nullable) | Thời điểm xác thực email
- password: string (required) | Mật khẩu (bắt buộc)
- is_active: boolean (required, default: true) | Trạng thái hoạt động
- account_type: enum['admin', 'customer'] (required) | Loại tài khoản
- avatar: string (nullable) | Ảnh đại diện
- provider: string (nullable) | Nhà cung cấp đăng nhập
- provider_id: string (nullable) | ID nhà cung cấp
- remember_token: string (nullable) | Token ghi nhớ
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

### Admins Table (Bảng Quản trị viên)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- user_id: bigint (FK → users.id) (1-1) | Khoá ngoại liên kết Users
- first_name: string (required) | Tên (bắt buộc)
- last_name: string (required) | Họ (bắt buộc)
- position: string (nullable) | Chức vụ
- department: string (nullable) | Phòng ban
- status: enum['active', 'inactive', 'blocked'] (required) | Trạng thái
- failed_login_attempts: integer (default: 0) | Số lần đăng nhập thất bại
- account_locked_until: timestamp (nullable) | Thời gian khoá tài khoản
- last_login_at: timestamp (nullable) | Lần đăng nhập cuối
- last_login_ip: string (nullable) | IP đăng nhập cuối
- created_by: bigint (nullable) | Người tạo
- updated_by: bigint (nullable) | Người cập nhật
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

### Customers Table (Bảng Khách hàng)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- user_id: bigint (FK → users.id) (1-1) | Khoá ngoại liên kết Users
- first_name: string (nullable) | Tên
- last_name: string (nullable) | Họ
- gender: enum['male', 'female', 'other'] (nullable) | Giới tính
- birthdate: date (nullable) | Ngày sinh
- bio: text (nullable) | Tiểu sử
- loyalty_points: integer (default: 0) | Điểm thưởng
- customer_rank: enum['regular', 'silver', 'gold', 'platinum'] | Hạng khách hàng
- preferred_contact_method: string (nullable) | Phương thức liên hệ ưu tiên
- last_login_at: timestamp (nullable) | Lần đăng nhập cuối
- rank_updated_at: timestamp (nullable) | Thời điểm cập nhật hạng
- preferences: json (nullable) | Tùy chọn cá nhân
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật

### Admin Activities Table (Bảng Hoạt động Admin)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- admin_id: bigint (FK → admins.id) (n-1) | Khoá ngoại liên kết Admins
- action: string (required) | Hành động thực hiện
- module: string (required) | Module tác động
- entity_type: string (required) | Loại đối tượng
- entity_id: bigint (required) | ID đối tượng
- old_values: json (nullable) | Giá trị cũ
- new_values: json (nullable) | Giá trị mới
- context: text (nullable) | Bối cảnh hành động
- ip_address: string (required) | Địa chỉ IP
- user_agent: string (required) | Thông tin trình duyệt
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật

### Admin Login History Table (Bảng Lịch sử Đăng nhập Admin)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- admin_id: bigint (FK → admins.id) (n-1) | Khoá ngoại liên kết Admins
- ip_address: string (required) | Địa chỉ IP
- user_agent: string (required) | Thông tin trình duyệt
- status: enum['success', 'failed'] (required) | Trạng thái đăng nhập
- login_at: timestamp (required) | Thời điểm đăng nhập
- logout_at: timestamp (nullable) | Thời điểm đăng xuất
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật

### Role History Table (Bảng Lịch sử Thay đổi Vai trò)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- admin_id: bigint (FK → admins.id) (n-1) | Khoá ngoại liên kết Admins
- changed_by: bigint (required) | Admin thực hiện thay đổi
- old_roles: json (required) | Vai trò cũ
- new_roles: json (required) | Vai trò mới
- reason: text (nullable) | Lý do thay đổi
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật

### Shipping Addresses Table (Bảng Địa chỉ Giao hàng)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- customer_id: bigint (FK → customers.id) (n-1) | Khoá ngoại liên kết Customers
- recipient_name: string(100) (required) | Tên người nhận
- phone: string(20) (required) | Số điện thoại
- email: string(100) (nullable) | Email người nhận
- address_line1: string (required) | Địa chỉ chi tiết dòng 1
- address_line2: string (nullable) | Địa chỉ chi tiết dòng 2
- province_code: unsignedBigInteger (FK → provinces.code) | Mã tỉnh/thành
- district_code: unsignedBigInteger (FK → districts.code) | Mã quận/huyện  
- commune_code: unsignedBigInteger (FK → communes.code) | Mã xã/phường
- postal_code: string(10) (nullable) | Mã bưu điện
- country: string(50) (default: 'Vietnam') | Quốc gia
- is_default: boolean (default: false) | Địa chỉ mặc định
- notes: text (nullable) | Ghi chú
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

### Provinces Table (Bảng Tỉnh/Thành phố)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- code: unsignedBigInteger (unique) | Mã tỉnh/thành phố
- name: string(100) | Tên tiếng Việt
- name_en: string(100) (nullable) | Tên tiếng Anh
- type: string(50) | Loại (tỉnh/thành phố)
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

### Districts Table (Bảng Quận/Huyện)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- code: unsignedBigInteger (unique) | Mã quận/huyện
- province_code: unsignedBigInteger (FK → provinces.code) | Mã tỉnh/thành phố
- name: string(100) | Tên tiếng Việt
- name_en: string(100) (nullable) | Tên tiếng Anh
- type: string(50) | Loại (quận/huyện)
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

### Communes Table (Bảng Xã/Phường)
- id: bigint (PK, auto-increment) | Khoá chính, tự tăng
- code: unsignedBigInteger (unique) | Mã xã/phường
- district_code: unsignedBigInteger (FK → districts.code) | Mã quận/huyện
- name: string(100) | Tên tiếng Việt
- name_en: string(100) (nullable) | Tên tiếng Anh
- type: string(50) | Loại (xã/phường)
- created_at, updated_at: timestamp | Thời gian tạo/cập nhật
- deleted_at: timestamp (nullable) | Thời gian xóa mềm

## 3. Relationships with Laravel Permission Tables
## 3. Quan hệ với các bảng của Laravel Permission

### Users Table Relationships (Quan hệ của bảng Users)
- roles (n-n): Through model_has_roles table | Quan hệ nhiều-nhiều qua bảng model_has_roles
- permissions (n-n): Through model_has_permissions table | Quan hệ nhiều-nhiều qua bảng model_has_permissions

### Spatie Permission Tables (Các bảng của Spatie Permission)
- roles | Vai trò
- permissions | Quyền hạn
- role_has_permissions | Quan hệ vai trò-quyền hạn
- model_has_roles | Quan hệ model-vai trò
- model_has_permissions | Quan hệ model-quyền hạn

## 4. Authentication Configuration
## 4. Cấu hình Xác thực

```php
// config/auth.php
'guards' => [
    'admin-api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
    'customer-api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ]
],
```

## 5. Route Structure
## 5. Cấu trúc Route

### Route Service Provider Configuration (Cấu hình Route Service Provider)
```php
// app/Providers/RouteServiceProvider.php
public function boot()
{
    $this->routes(function () {
        // Common API routes | Routes API chung
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        // Admin routes | Routes quản trị
        Route::middleware(['api', 'auth:admin-api', 'role:admin'])
            ->prefix('api/v1/admin')  
            ->group(base_path('routes/admin-api.php'));

        // Customer routes | Routes khách hàng
        Route::middleware(['api', 'auth:customer-api', 'role:customer'])
            ->prefix('api/v1/customer')
            ->group(base_path('routes/customer-api.php')); 
    });
}
```

### Route Files Structure (Cấu trúc File Routes)
```
routes/
  ├── api.php           # Common API endpoints | Endpoints chung
  ├── admin-api.php     # Admin endpoints | Endpoints quản trị
  └── customer-api.php  # Customer endpoints | Endpoints khách hàng
```

## 6. Security Recommendations
## 6. Đề xuất Bảo mật

### Authentication Enhancement (Tăng cường Xác thực)
- Implement Two-Factor Authentication (2FA) for admin accounts | Xác thực 2 lớp cho tài khoản admin
- Add refresh token mechanism with Passport | Cơ chế làm mới token với Passport
- Set up rate limiting for login attempts | Giới hạn số lần đăng nhập
- Implement password complexity requirements | Yêu cầu độ phức tạp mật khẩu
- Add session management and forced logout capability | Quản lý phiên và khả năng đăng xuất bắt buộc

### Activity Monitoring (Giám sát Hoạt động)
- Log all critical admin actions | Ghi log mọi hành động quan trọng của admin
- Track login attempts and suspicious activities | Theo dõi đăng nhập và hoạt động đáng ngờ
- Monitor API usage patterns | Giám sát mẫu sử dụng API
- Implement IP-based access restrictions | Hạn chế truy cập dựa trên IP

### Data Protection (Bảo vệ Dữ liệu)
- Encrypt sensitive data at rest | Mã hóa dữ liệu nhạy cảm
- Use HTTPS for all API communications | Sử dụng HTTPS cho mọi giao tiếp API
- Implement API request signing | Ký các request API
- Regular security audits | Kiểm tra bảo mật định kỳ

## 7. Performance Optimization
## 7. Tối ưu Hiệu suất

### Caching Strategy (Chiến lược Cache)
- Cache frequently accessed permissions and roles | Cache quyền và vai trò thường xuyên truy cập
- Implement repository pattern with cache layer | Áp dụng repository pattern với lớp cache
- Cache admin dashboard statistics | Cache thống kê dashboard
- Use Redis for session management | Sử dụng Redis quản lý phiên
- Cache address data hierarchically | Cache dữ liệu địa chỉ theo cấp bậc

### API Optimization (Tối ưu API)
- Implement API versioning | Phiên bản API
- Standardize API response format | Chuẩn hóa format response
- Use API resources/transformers | Sử dụng resources/transformers
- Implement pagination | Phân trang dữ liệu
- Rate limiting and throttling | Giới hạn tần suất gọi API
## 8. Maintenance Recommendations
## 8. Đề xuất Bảo trì

### Code Organization (Tổ chức Code)
- Implement service layer pattern | Áp dụng service layer pattern
- Use repository pattern | Sử dụng repository pattern
- Follow PSR standards | Tuân thủ chuẩn PSR
- Regular code reviews | Review code định kỳ

### Documentation (Tài liệu)
- Maintain API documentation | Duy trì tài liệu API
- Document security procedures | Tài liệu quy trình bảo mật
- Keep deployment guides updated | Cập nhật hướng dẫn triển khai
- Document database schema changes | Ghi chép thay đổi schema
```
