import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, message, Modal } from "antd";
import Cookies from "js-cookie";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import instanceAxios from "../../config/db";
import { ORDER_STATUS } from "../../constants/OrderConstants";
import useReview from "../../hooks/useReview";
import useScrollToTop from "../../hooks/useScrollToTop";
import { FomatTime } from "../../utils/FomatTime";
import FomatVND from "../../utils/FomatVND";
import Pagination from "../filterProduct/Pagination";
import SkeletonOrder from "../loadingSkeleton/SkeletonOrder";
import OrderItem from "./OrderItem";
import useReviewSubmit from "../../hooks/useReviewSubmit";
import getActionsForOrder from "../../utils/getActionsForOrder";
import useEchoChannel from "../../hooks/useEchoChannel";

const ORDER_STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "ready_to_ship", label: "Vận chuyển" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "return_refund", label: "Trả hàng/hoàn tiền" },
];

const calculateSubtotal = (item) => {
  const price =
    Number(item?.product?.price || item?.product_variant?.price) || 0;
  const discountPercent =
    Number(
      item?.product?.discount_percent || item?.product_variant?.discount_percent
    ) || 0;
  const quantity = Number(item?.quantity) || 0;

  // Calculate discounted price
  const discountedPrice = price - (price * discountPercent) / 100;

  return discountedPrice * quantity;
};

const MyOrder = ({ searchParam = "", setSearchParam }) => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // Thêm state cho input và search thực tế
  const [inputValue, setInputValue] = useState(searchParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  // Lấy trạng thái từ URL (ưu tiên URL, fallback 'all')
  const urlStatus = searchParams.get("status_group") || "all";
  const [orderStatus, setOrderStatus] = useState(urlStatus);
  const user = JSON.parse(Cookies.get("user"));
  const queryClient = useQueryClient();
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const { handleReviewSubmit } = useReviewSubmit(
    form,
    selectedOrder,
    setReviewModalVisible
  );
  const [returnRequestModalVisible, setReturnRequestModalVisible] =
    useState(false);

  // Handler cho real-time updates
  const handleOrderUpdate = useCallback((event) => {
    console.log('✅ MyOrder: Nhận được cập nhật trạng thái đơn hàng:', event);

    // Invalidate và refetch data
    queryClient.invalidateQueries(["orders"]);
  }, [queryClient]);

  // Sử dụng hook useEchoChannel để lắng nghe real-time updates
  const { connected, error: echoError, socketId, isSubscribed } = useEchoChannel(
    'orders.1',
    '.order-status-updated',
    handleOrderUpdate
  );

  // console.log("user", user);
  // Sử dụng hook scroll to top khi currentPage thay đổi
  useScrollToTop(currentPage);

  const selectedProduct =
    selectedOrder?.order_items?.[currentProductIndex] || null;
  const { submitReview } = useReview(
    selectedProduct?.product_id || selectedProduct?.product_variant?.product_id
  );

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", currentPage, searchTerm, orderStatus],
    queryFn: async () => {
      let url = `/api/v1/customer/orders?page=${currentPage}`;
      if (searchTerm.trim()) {
        url += `&keyword=${encodeURIComponent(searchTerm.trim())}`;
      }
      // Luôn truyền status_group, kể cả 'all'
      url += `&status_group=${orderStatus}`;
      const res = await instanceAxios.get(url);
      return res?.data;
    },
  });

  // console.log("orderData", apiResponse);

  // Truy cập đúng mảng đơn hàng từ cấu trúc phản hồi API
  const orders = apiResponse?.data?.data || [];
  const totalPages = apiResponse?.data?.last_page || 1;

  // 1. Dùng useMemo để group orders theo ngày (string)
  const ordersByDate = useMemo(() => {
    if (!Array.isArray(orders)) {
      console.error("orders is not an array:", orders);
      return {};
    }

    const result = {};
    const now = new Date();

    // Tạo các nhóm cố định
    result["Hôm nay"] = [];
    result["Hôm qua"] = [];
    result["Tuần này"] = [];
    result["Tháng này"] = [];
    result["Trước đó"] = [];

    orders.forEach((order) => {
      if (!order?.created_at) return;

      const orderDate = new Date(order.created_at);
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        result["Hôm nay"].push(order);
      } else if (daysDiff === 1) {
        result["Hôm qua"].push(order);
      } else if (daysDiff < 7) {
        result["Tuần này"].push(order);
      } else if (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      ) {
        result["Tháng này"].push(order);
      } else {
        result["Trước đó"].push(order);
      }
    });

    // Loại bỏ các nhóm trống
    Object.keys(result).forEach((key) => {
      if (result[key].length === 0) {
        delete result[key];
      }
    });

    return result;
  }, [orders]);

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="text-red-500">Error loading orders: {error.message}</div>
    );
  }

  // Mutation cho hủy đơn hàng
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.CANCELLED,
          customer_id: user.customerId,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("data", data);
      if (data?.message === "Order status updated successfully") {
        message.success("Đã hủy đơn hàng thành công");
        // queryClient.invalidateQueries(["orders", currentPage]);
        queryClient.invalidateQueries(["orders"]);
      } else {
        throw new Error(data?.message || "Không thể hủy đơn hàng");
      }
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    },
  });

  // Mutation cho xác nhận nhận hàng
  const confirmReceivedMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.COMPLETED,
          customer_id: user.customerId,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.message) {
        message.success("Đã xác nhận nhận hàng thành công");
        setConfirmModalVisible(false);
        // queryClient.invalidateQueries(["orders", currentPage]);
        queryClient.invalidateQueries(["orders"]);
      } else {
        throw new Error(data?.message || "Không thể xác nhận nhận hàng");
      }
    },
    onError: (error) => {
      message.error(
        error.response?.data?.message || "Không thể xác nhận nhận hàng"
      );
    },
  });

  // Mutation cho yêu cầu trả hàng
  const requestReturnMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await instanceAxios.put(
        `/api/v1/order/${orderId}/status`,
        {
          status: ORDER_STATUS.RETURN_REQUESTED,
          customer_id: user.customerId,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.message) {
        message.success("Đã gửi yêu cầu trả hàng");
        // queryClient.invalidateQueries(["orders", currentPage]);
        queryClient.invalidateQueries(["orders"]);
      } else {
        throw new Error(data?.message || "Không thể gửi yêu cầu trả hàng");
      }
    },
    onError: (error) => {
      message.error(
        error.response?.data?.message || "Không thể gửi yêu cầu trả hàng"
      );
    },
  });

  const handleAction = async (action, order) => {
    // console.log("order", order);
    if (!order?.id) {
      message.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      switch (action) {
        case "đánh giá":
          setSelectedOrder(order);
          setCurrentProductIndex(0);
          setReviewedProducts([]);
          setReviewModalVisible(true);
          break;

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

        case "mua lại":
          try {
            const cartItems =
              JSON.parse(localStorage.getItem("cartItems")) || [];
            const updatedCart = [...cartItems];

            order.order_items.forEach((item) => {
              const existingIndex = updatedCart.findIndex(
                (cartItem) =>
                  cartItem.product_id === item.product_id &&
                  (!item.variant_id || cartItem.variant_id === item.variant_id)
              );

              if (existingIndex !== -1) {
                updatedCart[existingIndex].quantity += item.quantity;
              } else {
                const generateId = () =>
                  Date.now() + Math.random().toString(36).substr(2, 9);
                updatedCart.push({
                  id: generateId(),
                  product_id: item.product_id,
                  variant_id: item.product_variant_id,
                  quantity: item.quantity,
                  sku: item.product_variant?.sku || item.product?.sku,
                  image: item.product?.image || item.product_variant?.image,
                  name: item.product?.name,
                  price: Number(item.original_price),
                  stock: item.product?.stock || item.product_variant?.stock,
                  thuoc_tinh:
                    item.product_variant?.product_attributes?.reduce(
                      (acc, attr) => {
                        acc[attr.attribute.name] = attr.attribute_value.value;
                        return acc;
                      },
                      {}
                    ) || {},
                  discount: Number(
                    item.product.discount_percent ||
                    item.product_variant.discount_percent
                  ),
                });
              }
            });

            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            message.success("Đã thêm sản phẩm vào giỏ hàng");
            window.dispatchEvent(
              new CustomEvent("cartUpdated", { detail: updatedCart })
            );
            nav("/cart");
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            message.error("Không thể thêm sản phẩm vào giỏ hàng");
          }
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

        case "xem trạng thái trả hàng":
          nav(`/my-profile/orders/${order.order_code}`);
          break;

        default:
          console.log(`Hành động chưa xử lý: ${action}`);
      }
    } catch (error) {
      console.error("Error handling action:", error);
      // Chỉ hiển thị lỗi chung nếu không phải do mutation xử lý
      if (
        ![
          cancelOrderMutation.isError,
          confirmReceivedMutation.isError,
          requestReturnMutation.isError,
        ].includes(true)
      ) {
        message.error("Có lỗi xảy ra khi thực hiện hành động");
      }
    }
  };

  // Khi searchParam trên URL thay đổi (ví dụ: back/forward), đồng bộ lại state
  // (Chỉ chạy khi searchParam thay đổi)
  useEffect(() => {
    setInputValue(searchParam);
    setSearchTerm(searchParam);
  }, [searchParam]);

  // Khi orderStatus thay đổi, reset về page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [orderStatus]);

  // Khi URL thay đổi (ví dụ reload/back/forward), đồng bộ lại state
  useEffect(() => {
    const urlStatus = searchParams.get("status_group") || "all";
    setOrderStatus(urlStatus);
  }, [searchParams]);

  const handleTabClick = (key) => {
    setOrderStatus(key);
    setCurrentPage(1);
    setSearchParams(params => {
      const newParams = new URLSearchParams(params);
      newParams.set("status_group", key);
      return newParams;
    });
  };

  console.log("orders", orders);

  return (
    <div className="dark:bg-gray-800 min-h-screen p-6">
      <div className="flex justify-between items-center mb-3">
        {ORDER_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={`px-2 py-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none transition-colors duration-150
              ${orderStatus === tab.key ? "border-b-2 border-black dark:border-white font-semibold" : ""}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mb-6">
        <input
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-2 w-1/2"
          placeholder="Tìm kiếm theo mã đơn hoặc tên sản phẩm"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCurrentPage(1);
              setSearchTerm(inputValue); // Chỉ cập nhật searchTerm khi nhấn Enter
              if (setSearchParam) setSearchParam(inputValue); // Cập nhật URL
            }
          }}
        />
      </div>
      {isLoading ? (
        <>
          <SkeletonOrder />
          <SkeletonOrder />
        </>
      ) : (
        <>
          <div className="space-y-8">
            {Object.entries(ordersByDate).length > 0 ? (
              Object.entries(ordersByDate).map(([dayLabel, orders]) => (
                <div
                  key={dayLabel}
                  className="border rounded-lg shadow-lg border-gray-200 dark:border-gray-700"
                >
                  {/* Tiêu đề ngày mua chỉ render 1 lần cho nhóm */}
                  <h3 className="m-3 text-lg font-semibold">{dayLabel}</h3>
                  <div>
                    {orders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-3 border mb-3 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                      >
                        {/* <Link to={`/my-profile/orders/${order.order_code}`}> */}
                        <OrderItem
                          order_items={order.order_items}
                          status={order.status}
                          payment_status={order.payment_status}
                          shipping_address={order.shipping_address}
                          customer_name={order.customer_name}
                          order_code={order.order_code}
                          reviewModalVisible={reviewModalVisible}
                          setReviewModalVisible={setReviewModalVisible}
                          selectedProduct={selectedProduct}
                          handleReviewSubmit={handleReviewSubmit}
                          form={form}
                          selectedOrder={selectedOrder}
                          currentProductIndex={currentProductIndex}
                          setCurrentProductIndex={setCurrentProductIndex}
                          reviewedProducts={reviewedProducts}
                          calculateSubtotal={calculateSubtotal}
                        />
                        {/* Phần Tổng tiền + button */}
                        <div className="flex items-end flex-col gap-2 pt-3 bg-white dark:bg-gray-800">
                          <div className="self-end">
                            <span className="mr-2 font-medium">Tổng tiền:</span>
                            <span className="font-bold">
                              {FomatVND(order?.total_amount)}
                            </span>
                          </div>
                          <div className="flex flex-row-reverse bg-white dark:bg-gray-800">
                            <Link
                              to={`/my-profile/orders/${order?.order_code}`}
                              className="ml-2 px-4 py-2 rounded-lg border border-black text-black dark:border-gray-500 dark:text-gray-200"
                            >
                              Chi tiết
                            </Link>
                            {/* Nút tiếp tục thanh toán */}
                            {order?.history &&
                              (() => {
                                const vnpayItem = order?.history?.find(
                                  (h) =>
                                    h.metadata?.vnpay_url &&
                                    h.metadata?.expire_date
                                );
                                if (!vnpayItem) return null;
                                const isVnpayExpired = (expireDateStr) => {
                                  if (!expireDateStr) return true;
                                  const expire = new Date(
                                    expireDateStr
                                  ).getTime();
                                  const now = Date.now();
                                  return now > expire;
                                };
                                const expired = isVnpayExpired(
                                  vnpayItem?.metadata?.expire_date
                                );
                                const isPaid = order?.history?.some(
                                  (h) => h.metadata?.new_payment_status === 1
                                );
                                if (expired || isPaid) return null;
                                return (
                                  <button
                                    className="ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
                                    onClick={() =>
                                    (window.location.href =
                                      vnpayItem.metadata.vnpay_url)
                                    }
                                  >
                                    Tiếp tục thanh toán
                                  </button>
                                );
                              })()}
                            {getActionsForOrder(order).map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAction(action, order)}
                                className="ml-2 px-4 py-2 rounded-lg border bg-black text-white dark:bg-gray-700 dark:text-gray-300 capitalize"
                                disabled={
                                  cancelOrderMutation.isLoading ||
                                  confirmReceivedMutation.isLoading ||
                                  requestReturnMutation.isLoading
                                }
                              >
                                {cancelOrderMutation.isLoading &&
                                  action === "hủy"
                                  ? "Đang xử lý..."
                                  : confirmReceivedMutation.isLoading &&
                                    action === "confirmReceived"
                                    ? "Đang xử lý..."
                                    : requestReturnMutation.isLoading &&
                                      action === "yêu cầu trả hàng"
                                      ? "Đang xử lý..."
                                      : action}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* </Link> */}
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
            {totalPages > 1 && (
              <div className="flex justify-end mt-4">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </>
      )}

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

export default MyOrder;
