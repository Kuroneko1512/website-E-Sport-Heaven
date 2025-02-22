<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo danh sách quyền hệ thống
        $permissions = [
            // Quản lý tài khoản admin
            'view_admins',
            'create_admins',
            'edit_admins',
            'delete_admins',

            // Quản lý permissions - Chỉ super_admin
            'view_permissions',
            'create_permissions',
            'edit_permissions',
            'delete_permissions',

            // Quản lý phân quyền
            'view_roles',
            'create_roles',
            'edit_roles',
            'delete_roles',

            // Quản lý sản phẩm cơ bản
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',

            // Quản lý biến thể sản phẩm
            'view_variants',
            'create_variants',
            'edit_variants',
            'delete_variants',

            // Quản lý thuộc tính
            'view_attributes',
            'create_attributes',
            'edit_attributes',
            'delete_attributes',

            // Quản lý giá trị thuộc tính
            'view_attribute_values',
            'create_attribute_values',
            'edit_attribute_values',
            'delete_attribute_values',

            // Quản lý đơn hàng
            'view_orders',
            'process_orders',
            'cancel_orders',
            'delete_orders',

            // Quản lý đánh giá sản phẩm
            'view_reviews',
            'approve_reviews',
            'delete_reviews',

            // Quản lý bài viết
            'view_posts',
            'create_posts',
            'edit_posts',
            'delete_posts',

            // Quản lý bình luận bài viết
            'view_comments',
            'approve_comments',
            'delete_comments',

            // Thống kê báo cáo
            'view_reports',
            'export_reports',

            // Quản lý khách hàng
            'view_customers',
            'create_customers',
            'edit_customers',
            'delete_customers',
        ];

        // Tạo các quyền trong database
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'admin'
            ]);
        }

        // Tạo vai trò và gán quyền tương ứng

        // Super Admin - Có toàn quyền hệ thống
        $superAdmin = Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'admin'
        ]);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - Quản lý chung nhưng không có quyền với permissions
        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'admin'
        ]);
        $admin->givePermissionTo([
            // Quản lý admin - Giới hạn
            'view_admins',
            'create_admins',
            'edit_admins',
            // Không có delete_admins

            // Quản lý roles - Giới hạn
            'view_roles',
            'edit_roles',
            // Không có create/delete roles

            // Quản lý sản phẩm cơ bản
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',

            // Quản lý biến thể sản phẩm
            'view_variants',
            'create_variants',
            'edit_variants',
            'delete_variants',

            // Quản lý thuộc tính
            'view_attributes',
            'create_attributes',
            'edit_attributes',
            'delete_attributes',

            // Quản lý giá trị thuộc tính
            'view_attribute_values',
            'create_attribute_values',
            'edit_attribute_values',
            'delete_attribute_values',

            // Quản lý đơn hàng
            'view_orders',
            'process_orders',
            'cancel_orders',
            'delete_orders',

            // Quản lý đánh giá sản phẩm
            'view_reviews',
            'approve_reviews',
            'delete_reviews',

            // Quản lý bài viết
            'view_posts',
            'create_posts',
            'edit_posts',
            'delete_posts',

            // Quản lý bình luận bài viết
            'view_comments',
            'approve_comments',
            'delete_comments',

            // Thống kê báo cáo
            'view_reports',
            'export_reports'

            // Các quyền khác trừ permissions management
        ]);

        // Nhân viên bán hàng
        $sales = Role::firstOrCreate([
            'name' => 'sales',
            'guard_name' => 'admin'
        ]);
        $sales->givePermissionTo([
            'view_products',
            'view_orders',
            'process_orders',
            'view_customers'
        ]);

        // Nhân viên kho
        $warehouse = Role::firstOrCreate([
            'name' => 'warehouse',
            'guard_name' => 'admin'
        ]);
        $warehouse->givePermissionTo([
            'view_products',
            'edit_products',
            'view_orders'
        ]);

        // Content Manager Role
        $content = Role::firstOrCreate([
            'name' => 'content',
            'guard_name' => 'admin'
        ]);
        $content->givePermissionTo([
            'view_posts',
            'create_posts',
            'edit_posts',
            'delete_posts',
            'view_comments',
            'approve_comments',
            'delete_comments'
        ]);

        // Customer Service Role
        $cs = Role::firstOrCreate([
            'name' => 'customer_service',
            'guard_name' => 'admin'
        ]);
        $cs->givePermissionTo([
            'view_orders',
            'process_orders',
            'view_customers',
            'edit_customers',
            'view_reviews',
            'approve_reviews'
        ]);
    }
}
