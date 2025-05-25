
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FomatVND from "../utils/FomatVND";
import { ORDER_STATUS_LABELS, ORDER_STATUS } from "../constants/OrderConstants";
import instanceAxios from "../config/db";
import ScrollToTop from "../config/ScrollToTop";
import { filterHistoryByStatusTo } from "../utils/filterHistoryByStatusTo";
import Echo from "laravel-echo";
import io from "socket.io-client";

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
  const { order_code } = useParams();

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
  window.io = io;
  window.echo = new Echo({
    broadcaster: 'socket.io',
    host: '127.0.0.1:6001',
    transports: ['websocket'],
    forceTLS: false,

  });
  window.echo.channel('orders.1')
    .subscribed(() => console.log('✅ Đã subscribe channel orders.1'))
    .listen('.order-status-updated', (e) => {
      console.log('✅ Event nhận được:', e);
      refetch();
    });


  console.log("orderData", orderData);

  // Hàm tính giá sản phẩm sau khi giảm giá
  const getDiscountedPrice = (item) => {
    // Chuyển đổi giá từ string sang số
    const basePrice = parseFloat(item.original_price);

    // Tính giá đã giảm
    return basePrice * item.quantity;
  };

  // console.log("calculateFinalTotal", calculateFinalTotal());

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
            className={`ml-2 px-3 py-1 rounded text-base ${statusStyles[orderData?.data?.status]
              }`}
          >
            {ORDER_STATUS_LABELS[orderData?.data?.status]}
          </span>
        </span>
      </header>

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
                  src={`http://127.0.0.1:8000/storage/${item.product_variant?.image || item.product.image
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
            {orderData?.data?.order_discount_type === 1
              ? `${orderData?.data?.order_discount_amount}%`
              : FomatVND(orderData?.data?.order_discount_amount || 0)}
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
    </div>
  );
};

export default OrderTracking;
