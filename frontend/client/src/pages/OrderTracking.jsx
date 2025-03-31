import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchOrderData = async (orderCode) => {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/order/showByCode/${orderCode}`);
  if (!response.ok) {
    throw new Error("Lỗi khi gọi API.");
  }
  const result = await response.json();
  if (result.status !== 200) {
    throw new Error("Không thể tải dữ liệu đơn hàng.");
  }
  return result.data;
};

const OrderTracking = () => {
  const [orderCode, setOrderCode] = useState("");
  const [searchCode, setSearchCode] = useState(null);
  
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ["order", searchCode],
    queryFn: () => fetchOrderData(searchCode),
    enabled: !!searchCode, // Chỉ gọi API khi có mã đơn hàng
    staleTime: 60000, // Cache dữ liệu trong 1 phút
  });

  const handleSearch = () => {
    setSearchCode(orderCode);
  };

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md h-screen my-7">
        <div className="mb-4 flex gap-2 justify-evenly">
          <input
            type="text"
            placeholder="Nhập mã đơn hàng..."
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            className="p-2 border rounded w-5/6"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Tìm kiếm
          </button>
        </div>
        
        {isLoading && <div className="h-screen flex justify-center">
          <div className="text-center text-gray-500 flex flex-col">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        </div>}
        {error && <p>{error.message}</p>}
        {!isLoading && !error && orderData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">THÔNG TIN ĐƠN HÀNG</h2>
                <p><strong>Mã đơn hàng:</strong> {orderData.order_code}</p>
                <p><strong>Trạng thái hiện tại:</strong> <span className="text-blue-600">{orderData.status}</span></p>
                <p><strong>Khách hàng:</strong> {orderData.customer_name}</p>
                <p><strong>Điện thoại:</strong> {orderData.customer_phone}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">THÔNG TIN CHI TIẾT</h2>
                {orderData.order_items.map((item, index) => (
                  <div key={index} className="border-b pb-2 mb-2">
                    <p><strong>Sản phẩm:</strong> {item.product?.name || "Không xác định"}</p>
                    {item.product_variant ? (
                      <p><strong>Phiên bản:</strong> {item.product_variant.sku} - {item.product_variant.price} đ</p>
                    ) : (
                      <p><strong>Giá:</strong> {item.price} đ</p>
                    )}
                    <p><strong>Số lượng:</strong> {item.quantity}</p>
                  </div>
                ))}
                <p><strong>Tiền thu hộ (COD):</strong> {orderData.total_amount} đ</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">ĐỊA CHỈ GIAO HÀNG</h2>
              <p><strong>Địa chỉ:</strong> {orderData.shipping_address}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;