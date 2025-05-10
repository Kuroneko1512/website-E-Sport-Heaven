import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FomatVND from "../utils/FomatVND";

// Image display component (commented for testing)

const ProductImage = ({ src, alt }) => (
  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
    {src ? (
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain"
      />
    ) : (
      <div className="text-gray-400 text-xs">No image</div>
    )}
  </div>
);


const fetchOrderData = async (orderCode) => {
  const response = await fetch(
    `http://127.0.0.1:8000/api/v1/order/showByCode/${orderCode}`
  );
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

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", searchCode],
    queryFn: () => fetchOrderData(searchCode),
    enabled: !!searchCode, // Chỉ gọi API khi có mã đơn hàng
    staleTime: 60000, // Cache dữ liệu trong 1 phút
  });
  console.log(orderData);
  // console.log(orderData.product.discount_percent)

  const handleSearch = () => {
    setSearchCode(orderCode);
  };

  console.log("orderData", orderData);

  const calculateTotal = () => {
    if (!orderData?.order_items) return 0;
    
    return orderData.order_items.reduce((total, item) => {
      let price = 0;
      if (item.product_variant) {
        price = item.product_variant.price * (1 - (item.product_variant.discount_percent || 0) / 100);
      } else {
        price = item.price * (1 - (item.product?.discount_percent || 0) / 100);
      }
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Theo dõi đơn hàng</h1>
        
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Nhập mã đơn hàng..."
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            Tìm kiếm
          </button>
        </div>

        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-600 rounded-lg shadow-md border border-red-200 w-full max-w-md mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 text-red-500"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <p className="text-lg font-semibold text-center">
              Không có dữ liệu hoặc server lỗi
            </p>
            <p className="text-sm text-center text-red-500">
              Xin vui lòng thử lại sau.
            </p>
          </div>
        )}
        {!isLoading && !error && orderData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  Thông tin đơn hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">{orderData.order_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-medium text-blue-600">{orderData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">{orderData.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điện thoại:</span>
                    <span className="font-medium">{orderData.customer_phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  Chi tiết đơn hàng
                </h2>
                <div className="space-y-4">
                  {orderData?.order_items?.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex gap-4">
                        {/* Uncomment this section to test image display */}
                        
                        <ProductImage 
                          src={`http://127.0.0.1:8000/storage/${item.product_variant?.image || item.product.image}`} 
                          alt={item.product?.name} 
                        />
                       
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">
                            {item.product?.name || "Không xác định"}
                          </h3>
                          {item.product_variant ? (
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Phiên bản: {item.product_variant.sku}</p>
                              <p>Giá: {FomatVND((item.product_variant.price - (( item.product_variant.discount_percent) * item.product_variant.price) / 100 ))}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              Giá: {FomatVND((item.price - (( item.product.discount_percent) * item.price) / 100 ))}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200 font-medium text-lg">
                    <div className="flex justify-between">
                      <span>Tổng tiền:</span>
                      <span>{FomatVND(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg col-span-full">
              <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
                Địa chỉ giao hàng
              </h2>
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-700">{orderData.shipping_address}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;