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
    UNPAID: 0,          // Chưa thanh toán
    PAID: 1             // Đã thanh toán
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.UNPAID]: "Chưa thanh toán",
    [PAYMENT_STATUS.PAID]: "Đã thanh toán"
};