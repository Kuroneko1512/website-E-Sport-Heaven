import { useQuery } from "@tanstack/react-query";
import React from "react";
import instanceAxios from "../../config/db";
import { useParams } from "react-router-dom";
import ScrollToTop from "../../config/ScrollToTop";

const OrderDetail = () => {
  const { order_code } = useParams();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/customer/orders/${order_code}`
      );
      return res.data;
    },
  });

  console.log("orderData", orderData);
  console.log("image", orderData?.data?.order_items);
  //   const {
  //     order_code,
  //     customer_name,
  //     customer_email,
  //     customer_phone,
  //     shipping_address,
  //     total_amount,
  //     status,
  //     "payment-status": paymentStatus,
  //     created_at,
  //     updated_at,
  //     order_items,
  //   } = orderData;

  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

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

  return (
    <div className="bg-white text-gray-800 p-6 max-w-4xl mx-auto">
      <ScrollToTop/>
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
            <strong>Địa chỉ:</strong>
            {orderData?.data?.shipping_address}
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
                  Giá: <strong>{formatPrice(item.price)}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tổng giá trị
          </h2>
          <p className="text-2xl font-bold text-red-500">
            {formatPrice(orderData?.data?.total_amount)}
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