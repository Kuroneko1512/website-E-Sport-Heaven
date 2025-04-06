import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import instanceAxios from "../../config/db";
import FomatVND from "../../utils/FomatVND";
import { FomatTime } from "../../utils/FomatTime";
import { Link } from "react-router-dom";

const OrderItem = ({ order_items, status }) => {
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 flex gap-4 items-start border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex-1 grid grid-cols-3 gap-4">
          {order_items?.map((item, index) => (
            <div
              key={index}
              className="col-span-3 flex items-center justify-between md:col-span-2 space-y-3 pb-3"
            >
              <div className="flex items-center space-x-4">
                <img
                  alt="Product Image"
                  className="h-16 w-16 rounded-md"
                  src={`http://127.0.0.1:8000/storage/${
                    item?.product?.image || item?.product_variant?.image
                  }`}
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-200">
                    {item?.product?.name}
                  </p>
                  {item?.product_variant?.product_attributes?.length > 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {item?.product_variant?.product_attributes.map(
                        (attr, index) => (
                          <span key={index}>
                            {attr?.attribute?.name}:{" "}
                            {attr.attribute_value?.value}{" "}
                          </span>
                        )
                      )}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    Số lượng: {item?.quantity}
                  </p>
                </div>
              </div>
              <span className="text-right">
                <p className="font-bold text-lg text-gray-900 dark:text-gray-200">
                  {FomatVND(item?.price)}
                </p>
              </span>
            </div>
          ))}
        </div>

        {/* Status hiển thị dọc toàn chiều cao */}
        <div className="w-24 text-center self-stretch flex items-center justify-center">
          <span className={`px-2 py-1 rounded text-base`}>
            {status}
          </span>
        </div>
      </div>
    </>
  );
};

const MyOrder = () => {
  const {
    data: orderData,
    isLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/customer/orders`);
      return res?.data?.data;
    },
  });

  console.log("orderData", orderData);

  // 1. Dùng useMemo để group orders theo ngày (string)
  const ordersByDate = useMemo(() => {
    return orderData?.reduce((groups, order) => {
      // FomatTime trả về chuỗi như "Hôm nay", "Hôm qua", hoặc "DD/MM/YYYY"
      const day = FomatTime(order.created_at);
      if (!groups[day]) groups[day] = [];
      groups[day].push(order);
      return groups;
    }, {});
  }, [orderData]);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="dark:bg-gray-800 min-h-screen p-6">
      {/* … filter, search bar … */}
      <div className="flex justify-between items-center mb-3">
            <div className="px-2 py-1">Tất cả</div>
            <div className="px-2 py-1">Chờ thanh toán</div>
            <div className="px-2 py-1">Vận chuyển</div>
            <div className="px-2 py-1">Chờ giao hàng</div>
            <div className="px-2 py-1">Hoàn thành</div>
            <div className="px-2 py-1">Đã hủy</div>
            <div className="px-2 py-1">Hoàn tiền/trả hàng</div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-2 w-1/2"
              placeholder="Tìm kiếm theo tên sản phẩm"
              type="text"
            />
          </div>
      <div className="space-y-8">
        {Object.entries(ordersByDate).map(([dayLabel, orders]) => (
          <div key={dayLabel} className="border p-3 rounded-lg shadow-lg border-gray-200 dark:border-gray-700">
            {/* Tiêu đề ngày mua chỉ render 1 lần cho nhóm */}
            <h3 className="mb-4 text-lg font-semibold">Ngày mua: {dayLabel}</h3>
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <div key={idx} >
                  <OrderItem {...order}/>
                  {/* Phần Tổng tiền + button */}
                  <div className="flex items-end flex-col gap-2 mt-3">
                    <div className="self-end">
                      <span className="mr-2 font-medium">Tổng tiền:</span>
                      <span className="font-bold">
                        {FomatVND(
                          order?.order_items?.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex flex-row-reverse w-1/3">
                      <Link to={`/my-profile/orders/${order?.order_code}`} className="px-4 py-2 rounded-lg border border-black text-black dark:border-gray-500 dark:text-gray-200">
                        Chi tiết
                      </Link>
                      <button className="px-4 py-2 rounded-lg border bg-black text-white dark:bg-gray-700 dark:text-gray-300">
                        Đánh giá
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
      )}
    </>
  );
};

export default MyOrder;