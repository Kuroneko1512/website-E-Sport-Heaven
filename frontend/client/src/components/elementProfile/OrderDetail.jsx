import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Modal, Form } from "antd";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import instanceAxios from "../../config/db";
import ScrollToTop from "../../config/ScrollToTop";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS,
} from "../../constants/OrderConstants";

import ReviewForm from "../elementProfile/ReviewForm";
import useReviewSubmit from "../../hooks/useReviewSubmit";
import getActionsForOrder from "../../utils/getActionsForOrder";

const OrderHistory = ({ history }) => {
  // Sort history by created_at descending
  const sortedHistory = [...history].sort(
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

const OrderDetail = () => {
  const { order_code } = useParams();

  const nav = useNavigate();
  const user = JSON.parse(Cookies.get("user"));
  const queryClient = useQueryClient();
  const [currentPage] = useState(1); // giữ currentPage để invalidate query
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { handleReviewSubmit } = useReviewSubmit(
    form,
    selectedOrder,
    setReviewModalVisible
  );
  const [returnRequestModalVisible, setReturnRequestModalVisible] =
    useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);

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
  } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/customer/orders/${order_code}`
      );
      return res.data;
    },
  });

  console.log("orderData", orderData);

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
        queryClient.invalidateQueries(["orders", currentPage]);
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
        queryClient.invalidateQueries(["orders", currentPage]);
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
        queryClient.invalidateQueries(["orders", currentPage]);
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
    } else if (
      item.product_variant &&
      item.product_variant.discount_percent != null
    ) {
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
      const quantity = parseInt(item.quantity, 10) || 0;
      return acc + discountedPrice * quantity;
    }, 0);
  };

  // Hàm tính tổng thanh toán cuối cùng
  const calculateFinalTotal = () => {
    const subtotal = calculateTotalAmount();
    const shippingFee = orderData?.data?.shipping_fee || 0;

    // Tính giảm giá
    let discountAmount = 0;
    if (orderData?.data?.order_discount_type === 1) {
      // Giảm giá theo phần trăm
      discountAmount = Number(
        subtotal * (Number(orderData?.data?.order_discount_amount) / 100)
      );
    } else {
      // Giảm giá theo giá trị cố định
      discountAmount = Number(orderData?.data?.order_discount_amount) || 0;
    }

    // Tổng thanh toán = Tổng tiền hàng + Phí vận chuyển - Giảm giá
    return subtotal + Number(shippingFee) - discountAmount;
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

  // Tính tổng giá tiền theo logic đã cập nhật
  const computedTotalAmount = calculateTotalAmount();
  const finalTotal = calculateFinalTotal();

  // Thêm kiểm tra dữ liệu orderData?.data trước khi render action buttons
  return (
    <div className="bg-white text-gray-800 p-6 max-w-4xl mx-auto">
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
      {/* 
      display: flex
;
    justify-content: flex-end;
    align-items: center;
      */}
      {/* Sửa lại phần render action button */}
      <div className="flex justify-end items-center mb-4">
        {orderData?.data &&
          getActionsForOrder(orderData?.data).map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleAction(action, orderData?.data)}
              className="ml-2 px-4 py-2 rounded-lg border bg-black text-white dark:bg-gray-700 dark:text-gray-300 capitalize"
              disabled={
                cancelOrderMutation.isLoading ||
                confirmReceivedMutation.isLoading ||
                requestReturnMutation.isLoading
              }
            >
              {cancelOrderMutation.isLoading && action === "hủy"
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
                      {" "}
                      {formatPrice(item.original_price)}
                    </span>
                  )}
                  <strong>{formatPrice(item.price)}</strong>
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
            {formatPrice(orderData?.data?.subtotal || 0)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Phí vận chuyển: </div>
          <span className="col-span-2">
            {formatPrice(orderData?.data?.shipping_fee || 0)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Giảm giá: </div>
          <span className="col-span-2">
            {orderData?.data?.order_discount_type === 0
              ? `${orderData?.data?.order_discount_amount}%`
              : formatPrice(orderData?.data?.order_discount_amount || 0)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4 grid grid-cols-6 p-4 gap-6">
          <div className="col-span-4">Tổng thanh toán: </div>
          <span className="text-2xl font-bold text-red-500 col-span-2">
            {formatPrice(orderData?.data?.total_amount)}
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

      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <button
            key="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleReviewSubmit(form.getFieldsValue())}
          >
            Đăng đánh giá
          </button>,
        ]}
        width={800}
      >
        <div className="max-h-[500px] overflow-y-auto">
          {selectedOrder?.order_items?.map((item, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <div className="flex items-start pb-4">
                <img
                  alt="Product Image"
                  className="h-24 w-24 rounded-md mr-4"
                  src={`http://127.0.0.1:8000/storage/${
                    item?.product?.image || item?.product_variant?.image
                  }`}
                />
                <div>
                  <p className="font-bold text-lg">{item?.product?.name}</p>
                  {item?.product_variant?.product_attributes?.length > 0 && (
                    <p className="text-gray-600">
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
                </div>
              </div>
              <ReviewForm namePrefix={`product_${index}`} form={form} />
            </div>
          ))}
        </div>
      </Modal>

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
              Bạn có thể yêu cầu hoàn trả hàng trong vòng 7 ngày kể từ ngày nhận
              hàng. Sau thời gian này, chúng tôi sẽ không thể xử lý yêu cầu hoàn
              trả của bạn.
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

export default OrderDetail;
