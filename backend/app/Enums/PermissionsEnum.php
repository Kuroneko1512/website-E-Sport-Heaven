<?php

namespace App\Enums;

// case NameInApp = 'name-in-database';
/**
 * Default System Features (No Permission Required):
 * - View products
 * - Add to cart (session)
 * - Place order (guest order)
 * - Track order (via order code + email) 
 * - Track shipping (via shipping code)
 * - View posts, reviews, comments
 * - Register account
 * - Login
 */

enum PermissionsEnum: string
{
    /* === ADMIN PERMISSIONS === */

    // Quản lý người dùng
    case AdminUserView = 'admin-user-view'; // Xem danh sách và thông tin chi tiết người dùng
    case AdminUserCreate = 'admin-user-create'; // Tạo mới tài khoản người dùng
    case AdminUserUpdate = 'admin-user-update'; // Cập nhật thông tin người dùng
    case AdminUserDelete = 'admin-user-delete'; // Xóa tài khoản người dùng
    case AdminUserBlock = 'admin-user-block'; // Khoá/mở khoá tài khoản người dùng
    case AdminUserRestore = 'admin-user-restore'; // Khôi phục tài khoản đã xóa
    case AdminUserExport = 'admin-user-export'; // Xuất danh sách người dùng

        // Quản lý vai trò
    case AdminRoleView = 'admin-role-view'; // Xem danh sách và chi tiết vai trò
    case AdminRoleCreate = 'admin-role-create'; // Tạo mới vai trò
    case AdminRoleUpdate = 'admin-role-update'; // Cập nhật thông tin vai trò
    case AdminRoleDelete = 'admin-role-delete'; // Xóa vai trò
    case AdminRoleAssign = 'admin-role-assign'; // Gán vai trò cho người dùng

        // Quản lý quyền
    case AdminPermissionView = 'admin-permission-view'; // Xem danh sách quyền
    case AdminPermissionCreate = 'admin-permission-create'; // Tạo mới quyền
    case AdminPermissionUpdate = 'admin-permission-update'; // Cập nhật quyền
    case AdminPermissionDelete = 'admin-permission-delete'; // Xóa quyền
    case AdminPermissionAssign = 'admin-permission-assign'; // Gán quyền cho vai trò

        // Quản lý sản phẩm
    case AdminProductView = 'admin-product-view'; // Xem danh sách và chi tiết sản phẩm
    case AdminProductCreate = 'admin-product-create'; // Tạo mới sản phẩm
    case AdminProductUpdate = 'admin-product-update'; // Cập nhật thông tin sản phẩm
    case AdminProductDelete = 'admin-product-delete'; // Xóa sản phẩm
    case AdminProductRestore = 'admin-product-restore'; // Khôi phục sản phẩm đã xóa
    case AdminProductExport = 'admin-product-export'; // Xuất danh sách sản phẩm
    case AdminProductImport = 'admin-product-import'; // Nhập danh sách sản phẩm

        // Quản lý biến thể
    case AdminVariantView = 'admin-variant-view'; // Xem danh sách và chi tiết biến thể
    case AdminVariantCreate = 'admin-variant-create'; // Tạo mới biến thể sản phẩm
    case AdminVariantUpdate = 'admin-variant-update'; // Cập nhật biến thể sản phẩm
    case AdminVariantDelete = 'admin-variant-delete'; // Xóa biến thể sản phẩm
    case AdminVariantStock = 'admin-variant-stock'; // Quản lý tồn kho biến thể

        // Quản lý thuộc tính
    case AdminAttributeView = 'admin-attribute-view'; // Xem danh sách thuộc tính
    case AdminAttributeCreate = 'admin-attribute-create'; // Tạo mới thuộc tính
    case AdminAttributeUpdate = 'admin-attribute-update'; // Cập nhật thuộc tính
    case AdminAttributeDelete = 'admin-attribute-delete'; // Xóa thuộc tính

        // Quản lý giá trị thuộc tính
    case AdminAttributeValueView = 'admin-attribute-value-view'; // Xem giá trị thuộc tính
    case AdminAttributeValueCreate = 'admin-attribute-value-create'; // Tạo giá trị thuộc tính
    case AdminAttributeValueUpdate = 'admin-attribute-value-update'; // Cập nhật giá trị thuộc tính
    case AdminAttributeValueDelete = 'admin-attribute-value-delete'; // Xóa giá trị thuộc tính

        // Quản lý đơn hàng
    case AdminOrderView = 'admin-order-view'; // Xem danh sách và chi tiết đơn hàng
    case AdminOrderCreate = 'admin-order-create'; // Tạo đơn hàng mới từ admin
    case AdminOrderUpdate = 'admin-order-update'; // Cập nhật thông tin đơn hàng
    case AdminOrderStatus = 'admin-order-status'; // Quản lý trạng thái đơn hàng
    case AdminOrderCancel = 'admin-order-cancel'; // Hủy đơn hàng
    case AdminOrderRefund = 'admin-order-refund'; // Xử lý hoàn tiền đơn hàng
    case AdminOrderReport = 'admin-order-report'; // Xuất báo cáo đơn hàng

        // Quản lý danh mục
    case AdminCategoryView = 'admin-category-view'; // Xem danh sách danh mục
    case AdminCategoryCreate = 'admin-category-create'; // Tạo mới danh mục
    case AdminCategoryUpdate = 'admin-category-update'; // Cập nhật danh mục
    case AdminCategoryDelete = 'admin-category-delete'; // Xóa danh mục

        // Quản lý bài viết
    case AdminPostView = 'admin-post-view'; // Xem danh sách và chi tiết bài viết
    case AdminPostCreate = 'admin-post-create'; // Tạo mới bài viết
    case AdminPostUpdate = 'admin-post-update'; // Cập nhật bài viết
    case AdminPostDelete = 'admin-post-delete'; // Xóa bài viết
    case AdminPostPublish = 'admin-post-publish'; // Xuất bản/hủy xuất bản bài viết

        // Quản lý bình luận
    case AdminCommentView = 'admin-comment-view'; // Xem danh sách bình luận
    case AdminCommentModerate = 'admin-comment-moderate'; // Kiểm duyệt bình luận
    case AdminCommentDelete = 'admin-comment-delete'; // Xóa bình luận

        // Quản lý khuyến mãi
    case AdminPromotionView = 'admin-promotion-view'; // Xem danh sách khuyến mãi
    case AdminPromotionCreate = 'admin-promotion-create'; // Tạo mới khuyến mãi
    case AdminPromotionUpdate = 'admin-promotion-update'; // Cập nhật khuyến mãi
    case AdminPromotionDelete = 'admin-promotion-delete'; // Xóa khuyến mãi

        // Quản lý đánh giá
    case AdminReviewView = 'admin-review-view'; // Xem danh sách đánh giá
    case AdminReviewModerate = 'admin-review-moderate'; // Kiểm duyệt đánh giá
    case AdminReviewDelete = 'admin-review-delete'; // Xóa đánh giá

        // Báo cáo & thống kê
    case AdminReportView = 'admin-report-view'; // Xem báo cáo thống kê
    case AdminReportGenerate = 'admin-report-generate'; // Tạo báo cáo mới
    case AdminReportExport = 'admin-report-export'; // Xuất báo cáo
    case AdminAnalyticsView = 'admin-analytics-view'; // Xem phân tích dữ liệu

        // Hỗ trợ khách hàng
    case AdminCustomerSupport = 'admin-customer-support'; // Hỗ trợ khách hàng
    case AdminCustomerChat = 'admin-customer-chat'; // Chat với khách hàng
    case AdminCustomerTicket = 'admin-customer-ticket'; // Xử lý ticket hỗ trợ

        // Quản lý vận chuyển
    case AdminShippingConfigManage = 'admin-shipping-config-manage'; // Cấu hình tích hợp API vận chuyển
    case AdminShippingPriceManage = 'admin-shipping-price-manage'; // Quản lý phụ phí vận chuyển

        // Quản lý SEO & Marketing
    case AdminSeoManage = 'admin-seo-manage'; // Quản lý meta tags, keywords
    case AdminBannerManage = 'admin-banner-manage'; // Quản lý banner quảng cáo
    case AdminNewsletterManage = 'admin-newsletter-manage'; // Quản lý đăng ký nhận tin
    case AdminEmailTemplateManage = 'admin-email-template-manage'; // Quản lý mẫu email

        // Cài đặt hệ thống
    case AdminSettingView = 'admin-setting-view'; // Xem cài đặt hệ thống
    case AdminSettingUpdate = 'admin-setting-update'; // Cập nhật cài đặt hệ thống
    case AdminBackupManage = 'admin-backup-manage'; // Quản lý sao lưu dữ liệu
    case AdminLogView = 'admin-log-view'; // Xem nhật ký hệ thống

        /* === CUSTOMER PERMISSIONS === */

        // Quản lý tài khoản
    case CustomerProfileManage = 'customer-profile-manage'; // Quản lý thông tin cá nhân
    case CustomerAddressManage = 'customer-address-manage'; // Quản lý địa chỉ giao hàng
    case CustomerNotificationManage = 'customer-notification-manage'; // Quản lý thông báo

        // Đặc quyền mua hàng
    case CustomerCartManage = 'customer-cart-manage'; // Quản lý giỏ hàng (lưu trong database)
    case CustomerOrderCreate = 'customer-order-create'; // Đặt hàng (liên kết với tài khoản)
    case CustomerOrderView = 'customer-order-view'; // Xem lịch sử đơn hàng
    case CustomerOrderCancel = 'customer-order-cancel'; // Hủy đơn hàng (trong thời gian cho phép)
    case CustomerCouponUse = 'customer-coupon-use'; // Sử dụng mã giảm giá thành viên

        // Tương tác & Đặc quyền
    case CustomerReviewWrite = 'customer-review-write'; // Viết đánh giá sản phẩm
    case CustomerCommentWrite = 'customer-comment-write'; // Viết bình luận
    case CustomerMessageSupport = 'customer-message-support'; // Gửi tin nhắn hỗ trợ
    case CustomerWishlistManage = 'customer-wishlist-manage'; // Quản lý danh sách yêu thích
    case CustomerCompareProducts = 'customer-compare-products'; // So sánh sản phẩm
    case CustomerNewsletterSubscribe = 'customer-newsletter-subscribe'; // Đăng ký/hủy đăng ký nhận tin

    public static function adminPermissions(): array
    {
        return [
            self::AdminUserView->value,
            self::AdminUserCreate->value,
            self::AdminUserUpdate->value,
            self::AdminUserDelete->value,
            self::AdminUserBlock->value,
            self::AdminUserRestore->value,
            self::AdminUserExport->value,
            // Quản lý vai trò
            self::AdminRoleView->value,
            self::AdminRoleCreate->value,
            self::AdminRoleUpdate->value,
            self::AdminRoleDelete->value,
            self::AdminRoleAssign->value,
            // Quản lý quyền
            self::AdminPermissionView->value,
            self::AdminPermissionCreate->value,
            self::AdminPermissionUpdate->value,
            self::AdminPermissionDelete->value,
            self::AdminPermissionAssign->value,
            // Quản lý sản phẩm
            self::AdminProductView->value,
            self::AdminProductCreate->value,
            self::AdminProductUpdate->value,
            self::AdminProductDelete->value,
            self::AdminProductRestore->value,
            self::AdminProductExport->value,
            self::AdminProductImport->value,
            // Quản Danh Mục
            self::AdminCategoryView->value,
            self::AdminCategoryCreate->value,
            self::AdminCategoryUpdate->value,
            self::AdminCategoryDelete->value,
            // Quản lý đơn hàng
            self::AdminOrderView->value,
            self::AdminOrderCreate->value,
            self::AdminOrderUpdate->value,
            self::AdminOrderStatus->value,
            self::AdminOrderCancel->value,
            self::AdminOrderRefund->value,
            self::AdminOrderReport->value,
            // Variant Management
            self::AdminVariantView->value,
            self::AdminVariantCreate->value,
            self::AdminVariantUpdate->value,
            self::AdminVariantDelete->value,
            self::AdminVariantStock->value,

            // Attribute Management
            self::AdminAttributeView->value,
            self::AdminAttributeCreate->value,
            self::AdminAttributeUpdate->value,
            self::AdminAttributeDelete->value,

            // Attribute Value Management
            self::AdminAttributeValueView->value,
            self::AdminAttributeValueCreate->value,
            self::AdminAttributeValueUpdate->value,
            self::AdminAttributeValueDelete->value,
            // Content Management
            self::AdminPostView->value,
            self::AdminPostCreate->value,
            self::AdminPostUpdate->value,
            self::AdminPostDelete->value,
            self::AdminPostPublish->value,

            // Comment Management
            self::AdminCommentView->value,
            self::AdminCommentModerate->value,
            self::AdminCommentDelete->value,

            // Review Management
            self::AdminReviewView->value,
            self::AdminReviewModerate->value,
            self::AdminReviewDelete->value,

            // Promotion Management
            self::AdminPromotionView->value,
            self::AdminPromotionCreate->value,
            self::AdminPromotionUpdate->value,
            self::AdminPromotionDelete->value,

            // Report & Analytics
            self::AdminReportView->value,
            self::AdminReportGenerate->value,
            self::AdminReportExport->value,
            self::AdminAnalyticsView->value,

            // Customer Support
            self::AdminCustomerSupport->value,
            self::AdminCustomerChat->value,
            self::AdminCustomerTicket->value,

            // Shipping Management
            self::AdminShippingConfigManage->value,
            self::AdminShippingPriceManage->value,

            // Marketing & SEO
            self::AdminSeoManage->value,
            self::AdminBannerManage->value,
            self::AdminNewsletterManage->value,
            self::AdminEmailTemplateManage->value,

            // System Settings
            self::AdminSettingView->value,
            self::AdminSettingUpdate->value,
            self::AdminBackupManage->value,
            self::AdminLogView->value,
        ];
    }

    public static function customerPermissions(): array
    {
        return [
            // Quản lý tài khoản
            self::CustomerProfileManage->value,
            self::CustomerAddressManage->value,
            self::CustomerNotificationManage->value,
            // Đặc quyền mua hàng
            self::CustomerCartManage->value,
            self::CustomerOrderCreate->value,
            self::CustomerOrderView->value,
            self::CustomerOrderCancel->value,
            self::CustomerCouponUse->value,
            // Tương tác & Đặc quyền
            self::CustomerReviewWrite->value,
            self::CustomerCommentWrite->value,
            self::CustomerMessageSupport->value,
            self::CustomerWishlistManage->value,
            self::CustomerCompareProducts->value,
            self::CustomerNewsletterSubscribe->value,
        ];
    }
}
