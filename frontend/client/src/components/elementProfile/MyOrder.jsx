import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import instanceAxios from "../../config/db";
import FomatVND from "../../utils/FomatVND";
import { FomatTime } from "../../utils/FomatTime";
import { Link } from "react-router-dom";
import { Divider } from "antd";
import SkeletonOrder from "../loadingSkeleton/SkeletonOrder";

const OrderItem = ({ order_items, status, order_code }) => {
  console.log("order_code", status);
  const statusStyles = {
    "đang xử lý":
      "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    "đã xác nhận":
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    "đang giao":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    "hoàn thành":
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    "đã hủy": "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };

const OrderItem = ({ order_items, status }) => {
  
  return (
    <>
      <h3 className="bg-white dark:bg-gray-800 pb-3 italic">
        Mã đơn hàng: {order_code}
      </h3>
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
          <span
            className={`px-2 py-1 rounded text-base ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>
      </div>
    </>
  );
};

const MyOrder = () => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await instanceAxios.get(`/api/v1/customer/orders`);
      return res?.data;
    },
  });

  console.log("orderData", apiResponse);

  // Truy cập đúng mảng đơn hàng từ cấu trúc phản hồi API
  const orders = apiResponse?.data?.data || [];

  // 1. Dùng useMemo để group orders theo ngày (string)
  const ordersByDate = useMemo(() => {
    // Kiểm tra xem orders có phải là mảng không
    if (!Array.isArray(orders)) {
      console.error("orders is not an array:", orders);
      return {}; // Trả về object rỗng nếu không phải mảng
    }

    return orders.reduce((groups, order) => {
      // FomatTime trả về chuỗi như "Hôm nay", "Hôm qua", hoặc "DD/MM/YYYY"
      const day = FomatTime(order.created_at);
      if (!groups[day]) groups[day] = [];
      groups[day].push(order);
      return groups;
    }, {});
  }, [orders]);

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="text-red-500">Error loading orders: {error.message}</div>
    );
  }

  const getActionsForOrder = (order) => {
    const actions = [];

    if (order.status === "đang xử lý") {
      actions.push("hủy");
    }

    if (order.status === "hoàn thành") {
      actions.push("đánh giá", "mua lại");

      // Kiểm tra điều kiện hoàn trả theo ngày
      const completedDate = new Date(order.updated_at || order.completed_at); // hoặc field khác phản ánh ngày hoàn thành
      const now = new Date();
      const diffInDays = (now - completedDate) / (1000 * 60 * 60 * 24);

      if (diffInDays <= 7) {
        actions.push("hoàn trả");
      }
    }

    if (order.status === "đã hủy") {
      actions.push("mua lại");
    }

    return actions;
  };

  const handleAction = (action, order) => {
    switch (action) {
      case "đánh giá":
        // điều hướng đến trang đánh giá
        console.log(`Thực hiện yêu cầu đánh giá cho đơn ${order.order_code}`);
        break;
      case "hủy":
        // gọi API hủy
        console.log(`Thực hiện yêu cầu đánh giá cho đơn ${order.order_code}`);

        break;
      case "mua lại":
        // thêm lại sản phẩm vào giỏ
        console.log(`Thực hiện yêu cầu đánh giá cho đơn ${order.order_code}`);
        break;
      case "hoàn trả":
        // mở modal hoặc điều hướng đến trang yêu cầu hoàn trả
        console.log(`Thực hiện yêu cầu hoàn trả cho đơn ${order.order_code}`);
        break;
      default:
        console.log(`Hành động chưa xử lý: ${action}`);
    }
  };
  

  return (
    <>
      {isLoading ? (
        <>
        <SkeletonOrder/>
        <SkeletonOrder/>
        </>
      ) : (
        <div className="dark:bg-gray-800 min-h-screen p-6">
          {/* … filter, search bar … */}
          <div className="flex justify-between items-center mb-3">
            <div className="px-2 py-1">Tất cả</div>
            <div className="px-2 py-1">Chờ thanh toán</div>
            <div className="px-2 py-1">Đang xử lý/đã xác nhận</div>
            <div className="px-2 py-1">Đang giao</div>
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
            {Object.entries(ordersByDate).length > 0 ? (
              Object.entries(ordersByDate).map(([dayLabel, orders]) => (
                <div
                  key={dayLabel}
                  className="border rounded-lg shadow-lg border-gray-200 dark:border-gray-700"
                >
                  {/* Tiêu đề ngày mua chỉ render 1 lần cho nhóm */}
                  <h3 className="m-3 text-lg font-semibold">
                    Ngày mua: {dayLabel}
                  </h3>
                  <div className="space-y-6">
                    {orders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                      >
                        <OrderItem
                          order_items={order.order_items}
                          status={order.status}
                          order_code={order.order_code}
                        />
                        {/* Phần Tổng tiền + button */}
                        <div className="flex items-end flex-col gap-2 pt-3 bg-white dark:bg-gray-800">
                          <div className="self-end">
                            <span className="mr-2 font-medium">Tổng tiền:</span>
                            <span className="font-bold">
                              {FomatVND(
                                order?.order_items?.reduce(
                                  (sum, item) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex flex-row-reverse bg-white dark:bg-gray-800">
                            <Link
                              to={`/my-profile/orders/${order?.order_code}`}
                              className="ml-2 px-4 py-2 rounded-lg border border-black text-black dark:border-gray-500 dark:text-gray-200"
                            >
                              Chi tiết
                            </Link>

                            {getActionsForOrder(order).map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAction(action, order)}
                                className="ml-2 px-4 py-2 rounded-lg border bg-black text-white dark:bg-gray-700 dark:text-gray-300 capitalize"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  Bạn chưa có đơn hàng nào
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
};

export default MyOrder;