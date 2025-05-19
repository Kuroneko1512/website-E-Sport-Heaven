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