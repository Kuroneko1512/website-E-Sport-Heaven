<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Enums\RolesEnum;
use App\Enums\PermissionsEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Chạy seeder tạo permissions và roles
     */
    public function run(): void
    {
        // Tạo permissions cho Admin
        foreach (PermissionsEnum::adminPermissions() as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'admin']
            );
        }

        // Tạo permissions cho Customer
        foreach (PermissionsEnum::customerPermissions() as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'customer']
            );
        }

        // Tạo các role Admin và gán permissions
        $this->createSuperAdmin();
        $this->createAdmin();
        $this->createProductManager();
        $this->createOrderManager();
        $this->createContentManager();
        $this->createMarketingManager();
        $this->createCustomerService();
        $this->createReportViewer();

        // Tạo các role Customer và gán permissions
        $this->createCustomer();
        $this->createVipCustomer();
        $this->createWholesaler();

        $superAdmin = User::where('email', 'superadmin@example.com')
            ->where('account_type', 'admin')
            ->first();
        if ($superAdmin) {
            $superAdmin->assignRole(RolesEnum::SuperAdmin->value);
        }

        $admin = User::where('email', 'admin@example.com')
            ->where('account_type', 'admin')
            ->first();
        if ($admin) {
            $admin->assignRole(RolesEnum::Admin->value);
        }
    }

    /**
     * Tạo role Super Admin với toàn quyền admin
     */
    private function createSuperAdmin()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::SuperAdmin->value],
            ['guard_name' => 'admin']
        );
        // Gán tất cả permission của guard admin
        $role->syncPermissions(Permission::where('guard_name', 'admin')->get());
    }

    /**
     * Tạo role Admin với quyền quản lý hệ thống
     */
    private function createAdmin()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::Admin->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions quản lý hệ thống, không có quyền phân role
        $role->syncPermissions([
            PermissionsEnum::AdminUserView->value,
            PermissionsEnum::AdminUserCreate->value,
            PermissionsEnum::AdminUserUpdate->value,
            PermissionsEnum::AdminUserBlock->value,
            PermissionsEnum::AdminProductView->value,
            PermissionsEnum::AdminProductCreate->value,
            PermissionsEnum::AdminProductUpdate->value,
            PermissionsEnum::AdminProductDelete->value,
            // Thêm các permission khác...
        ]);
    }

    /**
     * Tạo role Product Manager với quyền quản lý sản phẩm
     */
    private function createProductManager()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::ProductManager->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions liên quan đến sản phẩm
        $role->syncPermissions([
            PermissionsEnum::AdminProductView->value,
            PermissionsEnum::AdminProductCreate->value,
            PermissionsEnum::AdminProductUpdate->value,
            PermissionsEnum::AdminProductDelete->value,
            PermissionsEnum::AdminProductRestore->value,
            PermissionsEnum::AdminProductExport->value,
            PermissionsEnum::AdminProductImport->value,
            PermissionsEnum::AdminCategoryView->value,
            PermissionsEnum::AdminCategoryCreate->value,
            PermissionsEnum::AdminCategoryUpdate->value,
            PermissionsEnum::AdminCategoryDelete->value,
        ]);
    }

    /**
     * Tạo role Order Manager với quyền quản lý đơn hàng
     */
    private function createOrderManager()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::OrderManager->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions liên quan đến đơn hàng
        $role->syncPermissions([
            PermissionsEnum::AdminOrderView->value,
            PermissionsEnum::AdminOrderCreate->value,
            PermissionsEnum::AdminOrderUpdate->value,
            PermissionsEnum::AdminOrderStatus->value,
            PermissionsEnum::AdminOrderCancel->value,
            PermissionsEnum::AdminOrderRefund->value,
            PermissionsEnum::AdminOrderReport->value,
        ]);
    }

    /**
     * Tạo role Content Manager với quyền quản lý nội dung
     */
    private function createContentManager()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::ContentManager->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions liên quan đến nội dung
        $role->syncPermissions([
            PermissionsEnum::AdminPostView->value,
            PermissionsEnum::AdminPostCreate->value,
            PermissionsEnum::AdminPostUpdate->value,
            PermissionsEnum::AdminPostDelete->value,
            PermissionsEnum::AdminPostPublish->value,
            PermissionsEnum::AdminSeoManage->value,
            PermissionsEnum::AdminBannerManage->value,
        ]);
    }

    /**
     * Tạo role Marketing Manager với quyền quản lý marketing
     */
    private function createMarketingManager()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::MarketingManager->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions liên quan đến marketing
        $role->syncPermissions([
            PermissionsEnum::AdminPromotionView->value,
            PermissionsEnum::AdminPromotionCreate->value,
            PermissionsEnum::AdminPromotionUpdate->value,
            PermissionsEnum::AdminPromotionDelete->value,
            PermissionsEnum::AdminNewsletterManage->value,
            PermissionsEnum::AdminEmailTemplateManage->value,
        ]);
    }

    /**
     * Tạo role Customer Service với quyền hỗ trợ khách hàng
     */
    private function createCustomerService()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::CustomerService->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions liên quan đến chăm sóc khách hàng
        $role->syncPermissions([
            PermissionsEnum::AdminCustomerSupport->value,
            PermissionsEnum::AdminCustomerChat->value,
            PermissionsEnum::AdminCustomerTicket->value,
            PermissionsEnum::AdminOrderView->value,
            PermissionsEnum::AdminOrderStatus->value,
        ]);
    }

    /**
     * Tạo role Report Viewer chỉ có quyền xem báo cáo
     */
    private function createReportViewer()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::ReportViewer->value],
            ['guard_name' => 'admin']
        );
        // Gán permissions xem báo cáo
        $role->syncPermissions([
            PermissionsEnum::AdminReportView->value,
            PermissionsEnum::AdminAnalyticsView->value,
        ]);
    }

    /**
     * Tạo role Customer thường
     */
    private function createCustomer()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::Customer->value],
            ['guard_name' => 'customer']
        );
        // Gán permissions cơ bản cho khách hàng
        $role->syncPermissions([
            PermissionsEnum::CustomerProfileManage->value,
            PermissionsEnum::CustomerAddressManage->value,
            PermissionsEnum::CustomerCartManage->value,
            PermissionsEnum::CustomerOrderCreate->value,
            PermissionsEnum::CustomerOrderView->value,
            PermissionsEnum::CustomerReviewWrite->value,
        ]);
    }

    /**
     * Tạo role VIP Customer với đặc quyền thêm
     */
    private function createVipCustomer()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::VipCustomer->value],
            ['guard_name' => 'customer']
        );
        // Gán permissions của customer thường + đặc quyền VIP
        $role->syncPermissions([
            PermissionsEnum::CustomerProfileManage->value,
            PermissionsEnum::CustomerAddressManage->value,
            PermissionsEnum::CustomerCartManage->value,
            PermissionsEnum::CustomerOrderCreate->value,
            PermissionsEnum::CustomerOrderView->value,
            PermissionsEnum::CustomerReviewWrite->value,
            PermissionsEnum::CustomerCouponUse->value,
        ]);
    }

    /**
     * Tạo role Wholesaler với chính sách riêng
     */
    private function createWholesaler()
    {
        $role = Role::firstOrCreate(
            ['name' => RolesEnum::Wholesaler->value],
            ['guard_name' => 'customer']
        );
        // Gán permissions của customer + quyền bán sỉ
        $role->syncPermissions([
            PermissionsEnum::CustomerProfileManage->value,
            PermissionsEnum::CustomerAddressManage->value,
            PermissionsEnum::CustomerCartManage->value,
            PermissionsEnum::CustomerOrderCreate->value,
            PermissionsEnum::CustomerOrderView->value,
            PermissionsEnum::CustomerReviewWrite->value,
        ]);
    }
}
