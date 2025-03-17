<?php

namespace App\Enums;

enum RolesEnum: string
{
        // case NameInApp = 'name-in-database';
        /* === ADMIN ROLES === */
    case SuperAdmin = 'super-admin'; // Quyền cao nhất, quản lý toàn bộ hệ thống

    case Admin = 'admin'; // Quản lý vận hành chung, không có quyền phân role

    case ProductManager = 'product-manager'; // Quản lý sản phẩm, danh mục, kho

    case OrderManager = 'order-manager'; // Quản lý đơn hàng, vận chuyển, hoàn tiền

    case ContentManager = 'content-manager'; // Quản lý bài viết, SEO, banner

    case MarketingManager = 'marketing-manager'; // Quản lý khuyến mãi, email marketing

    case CustomerService = 'customer-service'; // Hỗ trợ khách hàng, xử lý khiếu nại

    case ReportViewer = 'report-viewer'; // Chỉ xem báo cáo thống kê

        /* === CUSTOMER ROLES === */
    case Customer = 'customer'; // Khách hàng đã đăng ký tài khoản

    case VipCustomer = 'vip-customer'; // Khách hàng VIP, có thêm ưu đãi đặc biệt

    case Wholesaler = 'wholesaler'; // Khách hàng bán buôn, có giá và chính sách riêng

    public static function labels()
    {
        return [
            self::SuperAdmin->value => 'Super Admin',
            self::Admin->value => 'Admin',
            self::ProductManager->value => 'Product Manager',
            self::OrderManager->value => 'Order Manager',
            self::ContentManager->value => 'Content Manager',
            self::MarketingManager->value => 'Marketing Manager',
            self::CustomerService->value => 'Customer Service',
            self::ReportViewer->value => 'Report Viewer',
            self::Customer->value => 'Customer',
            self::VipCustomer->value => 'Vip Customer',
            self::Wholesaler->value => 'Wholesaler',
        ];
    }

    public function label()
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::ProductManager => 'Product Manager',
            self::OrderManager => 'Order Manager',
            self::ContentManager => 'Content Manager',
            self::MarketingManager => 'Marketing Manager',
            self::CustomerService => 'Customer Service',
            self::ReportViewer => 'Report Viewer',
            self::Customer => 'Customer',
            self::VipCustomer => 'Vip Customer',
            self::Wholesaler => 'Wholesaler',
        };
    }
}
