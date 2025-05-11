import { useQuery } from "@tanstack/react-query";
import React from "react";
import instanceAxios from "../../config/db";
import { useParams } from "react-router-dom";
import ScrollToTop from "../../config/ScrollToTop";
import { ORDER_STATUS_LABELS, ORDER_STATUS } from "../../constants/OrderConstants";

const OrderDetail = () => {
  const { order_code } = useParams();

  const statusStyles = {
    [ORDER_STATUS.PENDING]: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    [ORDER_STATUS.CONFIRMED]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    [ORDER_STATUS.PREPARING]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.READY_TO_SHIP]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.SHIPPING]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.RETURN_REQUESTED]: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURN_PROCESSING]: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURNED_COMPLETED]: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    [ORDER_STATUS.RETURN_REJECTED]: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    [ORDER_STATUS.CANCELLED]: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
  };

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/customer/orders/${order_code}`
      );
      return res.data;
    },
  });

  console.log("orderData", orderData);

  // Hàm định dạng giá tiền
  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm tính giá sản phẩm sau khi giảm giá
  const getDiscountedPrice = (item) => {
    // Chuyển đổi giá từ string sang số
    const basePrice = parseFloat(item.price);
    let discountPercent = 0;

    // Ưu tiên dùng discount của sản phẩm nếu có
    if (item.product && item.product.discount_percent != null) {
      discountPercent = parseFloat(item.product.discount_percent);
    } else if (item.product_variant && item.product_variant.discount_percent != null) {
      discountPercent = parseFloat(item.product_variant.discount_percent);
    }
    // Tính giá đã giảm
    return basePrice * (1 - discountPercent / 100);
  };

  // Hàm tính tổng giá tiền của đơn hàng (cộng giá đã giảm của từng mặt hàng nhân với số lượng)
  const calculateTotalAmount = () => {
    if (!orderData || !orderData.data || !orderData.data.order_items) {
      return 0;
    }
    return orderData.data.order_items.reduce((acc, item) => {
      const discountedPrice = getDiscountedPrice(item);
      // Lấy số lượng (số lượng có thể là kiểu string, nên chuyển sang số)
      const quantity = parseInt(item.quantity, 10) || 0;
      return acc + discountedPrice * quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center text-gray-500 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-red-500">Đã có lỗi xảy ra: {error.message}</p>
      </div>
    );
  }

  // Tính tổng giá tiền theo logic đã cập nhật
  const computedTotalAmount = calculateTotalAmount();

  return (
    <div className="bg-white text-gray-800 p-6 max-w-4xl mx-auto">
      <ScrollToTop />
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
        <span className="text-lg">
          Mã đơn hàng: <strong>{order_code}</strong> | 
          <span className={`ml-2 px-3 py-1 rounded text-base ${statusStyles[orderData?.data?.status]}`}>
            {ORDER_STATUS_LABELS[orderData?.data?.status]}
          </span>
        </span>
      </header>

      <section className="grid grid-cols-1 gap-6 mb-8 border-b">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Thông tin khách hàng
          </h2>
          <p>
            <strong>Họ và tên:</strong> {orderData?.data?.customer_name}
          </p>
          <p>
            <strong>Email:</strong> {orderData?.data?.customer_email}
          </p>
          <p>
            <strong>Điện thoại:</strong> {orderData?.data?.customer_phone}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {orderData?.data?.shipping_address}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 ml-4">
          Sản phẩm đã đặt
        </h2>
        <div className="space-y-4">
          {orderData?.data?.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border-b"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={`http://127.0.0.1:8000/storage/${
                    item.product_variant?.image || item.product.image
                  }`}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    SKU: {item.product_variant?.sku || item.product.sku}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p>
                  Số lượng: <strong>{item.quantity}</strong>
                </p>
                <p>
                  Giá:{" "}
                  <strong>
                    {formatPrice(getDiscountedPrice(item))}
                  </strong>
                  {(item.product?.discount_percent > 0 || item.product_variant?.discount_percent > 0) && (
                      <span className="line-through text-gray-500 mr-2"> {formatPrice(item.price)}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 text-right">
        <div className="border-b pb-4 mb-4 grid grid-cols-6 gap-6">
          <div className="col-span-4">
            Tổng tiền hàng:{" "}
          </div>
          <span className="col-span-2">{formatPrice(computedTotalAmount)}</span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 gap-6">
          <div className="col-span-4">
            Phí vận chuyển:{" "}
          </div>
          <span className="col-span-2">{formatPrice(orderData?.data?.shipping_fee)}</span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 gap-6">
          <div className="col-span-4">
          Giảm giá:{" "}
          </div>
          <span className="col-span-2">{formatPrice(orderData?.data?.discount_amount)}</span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 gap-6">
          <div className="col-span-4">
          Tổng thanh toán:{" "}
          </div>
          <span className="text-2xl font-bold text-red-500 col-span-2">
            {formatPrice(
              computedTotalAmount + orderData?.data?.shipping_fee -
                orderData?.data?.discount_amount
            )}
          </span>
        </div>
        
        <div className="border-b pb-4 mb-4 grid grid-cols-6 gap-6">
          <div className="col-span-4">
            Phương thức thanh toán:{" "}
          </div>
          <span className="col-span-2">{orderData?.data?.payment_method}</span>
        </div>
      </section>

    </div>
  );
};

export default OrderDetail;