import { useQuery } from "@tanstack/react-query";
import React from "react";
import instanceAxios from "../../config/db";
import { useParams } from "react-router-dom";
import ScrollToTop from "../../config/ScrollToTop";

const OrderDetail = () => {
  const { order_code } = useParams();

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/customer/orders/${order_code}`
      );
      return res.data;
    },
  });

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
        <span className="text-sm italic">
          Mã đơn hàng: <strong>{order_code}</strong>
        </span>
      </header>

      <section className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-gray-100 p-4 rounded-lg shadow">
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Sản phẩm đã đặt
        </h2>
        <div className="space-y-4">
          {orderData?.data?.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow"
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
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tổng giá trị đơn hàng
          </h2>
          <p className="text-2xl font-bold text-red-500">
            {formatPrice(computedTotalAmount)}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Trạng thái
          </h2>
          <p>
            <strong>Đơn hàng:</strong>{" "}
            <span className="text-red-500">{orderData?.data?.status}</span>
          </p>
          <p>
            <strong>Thanh toán:</strong>{" "}
            <span className="text-red-500">
              {orderData?.data["payment-status"]}
            </span>
          </p>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500">
        <p>Ngày tạo: {formatDateTime(orderData?.data?.created_at)}</p>
        <p>Cập nhật: {formatDateTime(orderData?.data?.updated_at)}</p>
      </footer>
    </div>
  );
};

export default OrderDetail;