export const ORDER_STATUS = {
    PENDING: 0,                     // Đang xử lý
    CONFIRMED: 1,                   // Đã xác nhận
    PREPARING: 2,                   // Đang chuẩn bị
    READY_TO_SHIP: 3,               // Sẵn sàng giao
    SHIPPING: 4,                    // Đang giao
    DELIVERED: 5,                   // Giao thành công
    COMPLETED: 6,                   // Hoàn thành
    RETURN_REQUESTED: 7,            //Yêu cầu trả hàng
    RETURN_PROCESSING: 8,           // Đang xử lý trả hàng
    RETURNED_COMPLETED: 9,          // Đã trả hàng thành công
    RETURN_REJECTED: 14,            // Từ chối trả hàng
    CANCELLED: 10                   // Đã hủy
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: "Đang xử lý",
    [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
    [ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
    [ORDER_STATUS.READY_TO_SHIP]: "Sẵn sàng giao",
    [ORDER_STATUS.SHIPPING]: "Đang giao",
    [ORDER_STATUS.DELIVERED]: "Giao hàng thành công",
    [ORDER_STATUS.RETURN_REQUESTED]: "Yêu cầu trả hàng",
    [ORDER_STATUS.RETURN_PROCESSING]: "Đang xử lý trả hàng",
    [ORDER_STATUS.RETURNED_COMPLETED]: "Đã trả hàng thành công",
    [ORDER_STATUS.RETURN_REJECTED]: "Từ chối trả hàng",
    [ORDER_STATUS.COMPLETED]: "Hoàn thành",
    [ORDER_STATUS.CANCELLED]: "Đã hủy"
};

// Thêm định nghĩa màu sắc cho từng trạng thái đơn hàng
export const ORDER_STATUS_STYLES = {
    [ORDER_STATUS.PENDING]: "badge-primary",           // Xanh dương - Đang xử lý
    [ORDER_STATUS.CONFIRMED]: "badge-info",            // Xanh nhạt - Đã xác nhận
    [ORDER_STATUS.PREPARING]: "badge-secondary",       // Xám - Đang chuẩn bị
    [ORDER_STATUS.READY_TO_SHIP]: "badge-info",        // Xanh nhạt - Sẵn sàng giao
    [ORDER_STATUS.SHIPPING]: "badge-warning",          // Vàng - Đang giao
    [ORDER_STATUS.DELIVERED]: "badge-success",         // Xanh lá - Giao thành công
    [ORDER_STATUS.COMPLETED]: "badge-success",         // Xanh lá - Hoàn thành
    [ORDER_STATUS.RETURN_REQUESTED]: "badge-danger",   // Đỏ - Yêu cầu trả hàng
    [ORDER_STATUS.RETURN_PROCESSING]: "badge-danger",  // Đỏ - Đang xử lý trả hàng
    [ORDER_STATUS.RETURNED_COMPLETED]: "badge-dark",   // Đen - Đã trả hàng thành công
    [ORDER_STATUS.RETURN_REJECTED]: "badge-danger",    // Đỏ - Từ chối trả hàng
    [ORDER_STATUS.CANCELLED]: "badge-dark"             // Đen - Đã hủy
};

export const PAYMENT_STATUS = {
    UNPAID: 0,                  // Chưa thanh toán
    PAID: 1,                    // Đã thanh toán
    PARTIALLY_REFUNDED:2,       // Đã hoàn trả một phần
    FULLY_REFUNDED:3,           // Đã hoàn trả toàn bộ
    FAILED:4,                   // Thanh toán Thất bại
    EXPIRED:5,                   // Hết hạn thanh toán
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.UNPAID]: "Chưa thanh toán",
    [PAYMENT_STATUS.PAID]: "Đã thanh toán",
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "Đã hoàn trả một phần tiền",
    [PAYMENT_STATUS.FULLY_REFUNDED]: "Đã hoàn trả toàn bộ tiền",
    [PAYMENT_STATUS.FAILED]: "Thanh toán Thất bại",
    [PAYMENT_STATUS.EXPIRED]: "Hết hạn thanh toán",
};

// Thêm định nghĩa màu sắc cho từng trạng thái thanh toán
export const PAYMENT_STATUS_STYLES = {
    [PAYMENT_STATUS.UNPAID]: "badge-warning",              // Vàng - Chưa thanh toán
    [PAYMENT_STATUS.PAID]: "badge-success",                // Xanh lá - Đã thanh toán
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "badge-info",     // Xanh nhạt - Hoàn trả một phần
    [PAYMENT_STATUS.FULLY_REFUNDED]: "badge-dark",         // Đen - Hoàn trả toàn bộ
    [PAYMENT_STATUS.FAILED]: "badge-danger",               // Đỏ - Thanh toán thất bại
    [PAYMENT_STATUS.EXPIRED]: "badge-secondary",           // Xám - Hết hạn thanh toán
};

export const ORDER_REASON = {
    PRODUCT_DEFECT: 0,           // Lỗi sản phẩm
    WRONG_ITEM: 1,               // Sản phẩm sai
    CUSTOMER_CHANGE_MIND: 2,     // Khách hàng thay đổi ý định
    LATE_DELIVERY: 3,            // Giao hàng trễ
    OTHER: 4                     // Lý do khác
};

export const ORDER_REASON_LABELS = {
    [ORDER_REASON.PRODUCT_DEFECT]: "Lỗi sản phẩm",
    [ORDER_REASON.WRONG_ITEM]: "Sản phẩm sai",
    [ORDER_REASON.CUSTOMER_CHANGE_MIND]: "Khách hàng thay đổi ý định",
    [ORDER_REASON.LATE_DELIVERY]: "Giao hàng trễ",
    [ORDER_REASON.OTHER]: "Lý do khác"
};

// Thêm định nghĩa cho phương thức thanh toán
export const PAYMENT_METHODS = {
    COD: 'cod',
    VNPAY: 'vnpay',
    BANK_TRANSFER: 'bank_transfer',
    MOMO: 'momo',
    ZALOPAY: 'zalopay'
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.COD]: 'COD',
    [PAYMENT_METHODS.VNPAY]: 'VNPay',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
    [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
    [PAYMENT_METHODS.ZALOPAY]: 'ZaloPay'
};

export const PAYMENT_METHOD_STYLES = {
    [PAYMENT_METHODS.COD]: 'badge-warning',        // Vàng - COD
    [PAYMENT_METHODS.VNPAY]: 'badge-primary',      // Xanh dương - VNPay
    [PAYMENT_METHODS.BANK_TRANSFER]: 'badge-info', // Xanh nhạt - Chuyển khoản
    [PAYMENT_METHODS.MOMO]: 'badge-danger',        // Đỏ - MoMo
    [PAYMENT_METHODS.ZALOPAY]: 'badge-success',    // Xanh lá - ZaloPay
};