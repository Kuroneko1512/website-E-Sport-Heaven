import React, { useRef, useEffect, useCallback, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import FomatVND from "../utils/FomatVND";
import { ORDER_STATUS_LABELS, ORDER_STATUS } from "../constants/OrderConstants";
import instanceAxios from "../config/db";
import ScrollToTop from "../config/ScrollToTop";
import { filterHistoryByStatusTo } from "../utils/filterHistoryByStatusTo";
import Echo from "laravel-echo";
import io from "socket.io-client";
import useEchoChannel from "../hooks/useEchoChannel"; // Import hook useEchoChannel realtime
import getActionsForOrder2 from "../utils/getActionsForOrder2";
import { Modal } from "antd";

const OrderHistory = ({ history }) => {
  // Lọc trùng status_to, giữ bản ghi mới nhất
  const filteredHistory = filterHistoryByStatusTo(history);
  // Sort lại theo created_at giảm dần (đã được filter giữ bản mới nhất)
  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  console.log("sortedHistory", sortedHistory);

  return (
    <div className="rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
        Lịch sử đơn hàng
      </h2>
      <div className="space-y-4">
        {sortedHistory.map((item, index) => {
          // Determine the status to display
          let statusLabel = null;
          if (item.metadata?.new_payment_status !== undefined) {
            statusLabel =
              item.metadata.new_payment_status === 1
                ? "Đã thanh toán"
                : "Chưa thanh toán";
          } else if (item.status_to !== null) {
            statusLabel =
              ORDER_STATUS_LABELS[item.status_to] || "Hành động không xác định";

            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-gray-800">{statusLabel}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {/* {item.notes && (
                    <p className="text-sm text-gray-600 italic max-w-xl">
                      {item.notes}
                    </p>
                  )} */}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const nav = useNavigate();
  const { order_code } = useParams();
    const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [returnRequestModalVisible, setReturnRequestModalVisible] =
    useState(false);

  const statusStyles = {
    [ORDER_STATUS.PENDING]:
      "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    [ORDER_STATUS.CONFIRMED]:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    [ORDER_STATUS.PREPARING]:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.READY_TO_SHIP]:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.SHIPPING]:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    [ORDER_STATUS.DELIVERED]:
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.COMPLETED]:
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [ORDER_STATUS.RETURN_REQUESTED]:
      "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURN_PROCESSING]:
      "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    [ORDER_STATUS.RETURNED_COMPLETED]:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    [ORDER_STATUS.RETURN_REJECTED]:
      "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    [ORDER_STATUS.CANCELLED]:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };

  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/order/showByCode/${order_code}`
      );
      return res.data;
    },
  });

  // Sử dụng hook useEchoChannel để lắng nghe cập nhật đơn hàng
  // Tham số 1: Tên kênh - 'orders.1' là kênh chung cho tất cả đơn hàng
  // Tham số 2: Tên sự kiện - '.order-status-updated' là sự kiện khi trạng thái đơn hàng được cập nhật
  // Tham số 3: Callback xử lý khi nhận được sự kiện - ở đây là gọi refetch() để tải lại dữ liệu đơn hàng
  // Sử dụng useCallback để tạo callback function mà vẫn giữ được tham chiếu ổn định
  const handleOrderUpdate = useCallback(
    (event) => {
      console.log("✅ Nhận được cập nhật trạng thái đơn hàng:", event);
      refetch();
    },
    [refetch]
  );

  // Sử dụng hook useEchoChannel đã sửa
  const {
    connected,
    error: echoError,
    socketId,
    isSubscribed,
  } = useEchoChannel("orders.1", ".order-status-updated", handleOrderUpdate);

  // realtime old
  // window.io = io;
  // window.echo = new Echo({
  //   broadcaster: 'socket.io',
  //   host: '127.0.0.1:6001',
  //   transports: ['polling', 'websocket'], // Thêm polling làm phương thức dự phòng
  //   forceTLS: false,
  //   enabledTransports: ['ws', 'wss', 'polling'],
  // });

  // window.echo.channel('orders.1')
  //   .subscribed(() => console.log('✅ Đã subscribe channel orders.1'))
  //   .error((error) => console.error('❌ Channel orders.1 lỗi:', error))
  //   .listen('.order-status-updated', (e) => {
  //     console.log('✅ Event nhận được:', e);
  //     refetch();
  //   });

  // const socket = window.echo.connector.socket;

  // // Thêm debug
  // socket.on('connect', () => {
  //   console.log('✅ Kết nối thành công đến Echo Server', socket.id);
  // });

  // socket.on('connect_error', (error) => {
  //   console.error('❌ Lỗi kết nối:', error.message);
  //   // Thêm thông tin chi tiết về lỗi
  //   console.error('Chi tiết:', {
  //     type: error.type,
  //     description: error.description
  //   });
  // });

  // socket.on('disconnect', (reason) => {
  //   console.log('❌ Đã ngắt kết nối từ Echo Server', reason);
  // });

  // // Thêm một số sự kiện debug khác
  // socket.on('reconnect_attempt', (attempt) => {
  //   console.log(`⚠️ Đang thử kết nối lại lần ${attempt}`);
  // });

  console.log("orderData", orderData);

  // Hàm tính giá sản phẩm sau khi giảm giá
  const getDiscountedPrice = (item) => {
    // Chuyển đổi giá từ string sang số
    const basePrice = parseFloat(item.original_price);

    // Tính giá đã giảm
    return basePrice * item.quantity;
  };

  // console.log("calculateFinalTotal", calculateFinalTotal());

  // Mutation cho hủy đơn hàng
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.CANCELLED,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation cho xác nhận nhận hàng
  const confirmReceivedMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.COMPLETED,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation cho yêu cầu trả hàng
  const requestReturnMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.RETURN_REQUESTED,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Xử lý action
  const handleAction = (action, order) => {
    if (!order?.id) return;
    switch (action) {
      case "hủy":
        Modal.confirm({
          title: "Xác nhận hủy đơn hàng",
          content: (
            <div>
              <p>
                Bạn có chắc chắn muốn hủy đơn hàng{" "}
                <strong>{order.order_code}</strong>?
              </p>
              <div className="bg-yellow-50 p-3 rounded-lg mt-2">
                <p className="text-yellow-800">
                  Lưu ý: Sau khi hủy, đơn hàng sẽ không thể khôi phục.
                </p>
              </div>
            </div>
          ),
          okText: "Xác nhận hủy",
          cancelText: "Không",
          okButtonProps: {
            danger: true,
            loading: cancelOrderMutation.isLoading,
          },
          onOk: () => cancelOrderMutation.mutate({ orderId: order.id }),
        });
        break;
      case "Đã nhận hàng":
        setSelectedOrder(order);
        setConfirmModalVisible(true);
        break;

      case "confirmReceived":
        confirmReceivedMutation.mutate({ orderId: order.id });
        break;

      // Ấn yêu cầu trả hàng, chuyển sang màn hình gửi form yêu cầu trả hàng, khi nào điền xong for và ấn submit thì mới chuyển trạng thái.
      case "yêu cầu trả hàng":
        setSelectedReturnOrder(order);
        setReturnRequestModalVisible(true);
        break;
      default:
        break;
    }
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

  return (
    <div className="bg-white text-gray-800 p-6 max-w-4xl mx-auto mt-10">
      <ScrollToTop />
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
        <span className="text-lg">
          Mã đơn hàng: <strong>{order_code}</strong> |
          <span
            className={`ml-2 px-3 py-1 rounded text-base ${
              statusStyles[orderData?.data?.status]
            }`}
          >
            {ORDER_STATUS_LABELS[orderData?.data?.status]}
          </span>
        </span>
      </header>
      {/* Nút sự kiện cho đơn hàng */}
      {orderData?.data && (
        <div className="flex justify-end items-center mb-4">
          {getActionsForOrder2(orderData.data).map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleAction(action, orderData.data)}
              className="ml-2 px-4 py-2 rounded-lg border bg-black text-white capitalize"
              disabled={
                cancelOrderMutation.isLoading ||
                confirmReceivedMutation.isLoading ||
                requestReturnMutation.isLoading
              }
            >
              {cancelOrderMutation.isLoading && action === "hủy"
                ? "Đang xử lý..."
                : confirmReceivedMutation.isLoading && action === "Đã nhận hàng"
                ? "Đang xử lý..."
                : requestReturnMutation.isLoading &&
                  action === "yêu cầu trả hàng"
                ? "Đang xử lý..."
                : action}
            </button>
          ))}
        </div>
      )}
      <section className="grid grid-cols-4 gap-6 mb-8 border-b">
        <div className="p-4 grid col-span-2">
          <div className="space-y-4">
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
        </div>
        <div className="p-4 grid col-span-2">
          {/* <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lịch sử đơn hàng
          </h2> */}
          {orderData?.data?.history && orderData?.data?.history.length > 0 && (
            <div className="mb-8">
              <OrderHistory history={orderData?.data.history} />
            </div>
          )}
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
                  <p>
                    Số lượng: <strong>{item.quantity}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p>
                  {(item.product?.discount_percent > 0 ||
                    item.product_variant?.discount_percent > 0) && (
                    <span className="line-through text-gray-500 mr-2">
                      {FomatVND(getDiscountedPrice(item))}
                    </span>
                  )}
                  <strong>{FomatVND(item.subtotal)}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 text-right">
        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Tổng tiền hàng: </div>
          <span className="col-span-2">
            {FomatVND(orderData?.data?.subtotal || 0)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Phí vận chuyển: </div>
          <span className="col-span-2">
            {FomatVND(orderData?.data?.shipping_fee || 0)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Giảm giá: </div>
          <span className="col-span-2">
            {FomatVND(orderData?.data?.order_discount_amount || 0)}
          </span>
        </div>

        <div className="border-b pb-4grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Tổng thanh toán: </div>
          <span className="text-2xl font-bold text-red-500 col-span-2">
            {FomatVND(orderData?.data?.total_amount)}
          </span>
        </div>
        <div className="border border-yellow-300 bg-yellow-100 text-left p-4 gap-6">
          <span className="">
            {orderData?.data?.payment_status === 1 ? (
              <div className="text-yellow-600">
                <i className="fas fa-bell" /> Đã thanh toán. Vui kiểm tra lại
                thông tin đơn hàng.
              </div>
            ) : (
              <div className="text-yellow-600">
                <i className="fas fa-bell" /> Vui lòng thanh toán{" "}
                {FomatVND(orderData?.data?.total_amount)} khi nhận hàng.
              </div>
            )}
          </span>
        </div>
        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Phương thức thanh toán: </div>
          <span className="col-span-2">
            {orderData?.data?.payment_method === "cod"
              ? "Thanh toán tiền mặt"
              : "Thanh toán online"}
          </span>
        </div>
      </section>

      {/* Add Confirmation Modal */}
      <Modal
        title="Xác nhận đã nhận hàng"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <button
            key="cancel"
            className="px-4 py-2 border rounded-lg mr-2"
            onClick={() => setConfirmModalVisible(false)}
            disabled={confirmReceivedMutation.isLoading}
          >
            Hủy
          </button>,
          <button
            key="confirm"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => handleAction("confirmReceived", selectedOrder)}
            disabled={confirmReceivedMutation.isLoading}
          >
            {confirmReceivedMutation.isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>,
        ]}
      >
        <div className="p-4">
          <p className="mb-4">Bạn có chắc chắn đã nhận được hàng?</p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Lưu ý quan trọng:</strong>
            </p>
            <p className="text-yellow-700 mt-2">
              Khi bạn xác nhận đã nhận hàng, bạn sẽ không thể yêu cầu trả hàng
              cho đơn hàng này nữa. Nếu bạn gặp vấn đề với sản phẩm, vui lòng
              liên hệ với chúng tôi.
            </p>
          </div>
        </div>
      </Modal>
      {/* Modal xác nhận yêu cầu trả hàng */}
      <Modal
        title="Xác nhận yêu cầu trả hàng"
        open={returnRequestModalVisible}
        onCancel={() => setReturnRequestModalVisible(false)}
        footer={[
          <button
            key="cancel"
            className="px-4 py-2 border rounded-lg mr-2"
            onClick={() => setReturnRequestModalVisible(false)}
          >
            Hủy
          </button>,
          <button
            key="confirm"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => {
              setReturnRequestModalVisible(false);
              if (selectedReturnOrder) {
                nav(`/orders/${selectedReturnOrder.order_code}/return-request`);
              }
            }}
          >
            Xác nhận
          </button>,
        ]}
      >
        <div className="p-4">
          <p className="mb-4">
            Bạn có chắc chắn muốn gửi yêu cầu trả hàng cho đơn{" "}
            <strong>{selectedReturnOrder?.order_code}</strong>?
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Lưu ý:</strong>
            </p>
            <p className="text-yellow-700 mt-2">
              Sau khi xác nhận, bạn sẽ được chuyển đến form để hoàn tất yêu cầu
              trả hàng.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderTracking;
