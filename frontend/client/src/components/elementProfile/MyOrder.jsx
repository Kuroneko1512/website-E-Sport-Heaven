import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import instanceAxios from "../../config/db";
import FomatVND from "../../utils/FomatVND";
import { FomatTime } from "../../utils/FomatTime";
import { Link, useNavigate } from "react-router-dom";
import { Divider, message, Modal, Table, Form } from "antd";
import ReviewForm from "./ReviewForm";
import useReview from "../../hooks/useReview";
import SkeletonOrder from "../loadingSkeleton/SkeletonOrder";
import Cookies from "js-cookie";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS,
} from "../../constants/OrderConstants";
import Pagination from "../filterProduct/Pagination";
import useScrollToTop from "../../hooks/useScrollToTop";

const OrderItem = ({
  order_items,
  customer_name,
  status,
  shipping_address,
  order_code,
  reviewModalVisible,
  setReviewModalVisible,
  selectedProduct,
  handleReviewSubmit,
  form,
  selectedOrder,
  currentProductIndex,
  setCurrentProductIndex,
  reviewedProducts,
}) => {
  const totalAmount = order_items.reduce((total, item) => {
    return total + calculateSubtotal(item);
  }, 0);

  // console.log("order_code", status);
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

  return (
    <>
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
      <h3 className="bg-white flex justify-between border-b border-gray-200 items-center dark:bg-gray-800 pb-3">
        <div className="flex flex-col gap-2">
          <span>
            Mã đơn hàng: <strong>{order_code}</strong>
          </span>
          <span className="text-sm">{customer_name}</span>
          <span className="text-sm">
            {shipping_address.substring(0, 60)}...
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-base ${statusStyles[status]}`}>
          {ORDER_STATUS_LABELS[status]}
        </span>
      </h3>

      <div className="bg-white dark:bg-gray-800 flex gap-4 items-start border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex-1 grid grid-cols-3 gap-4">
          {order_items?.map((item, index) => (
            <div
              key={index}
              className="col-span-3 flex items-center justify-between  space-y-3 pb-3"
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
                  {/* Attributes */}
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
                  {/* {FomatVND(calculate(item))} */}
                  {FomatVND(item?.price)}
                </p>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

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
const calculate = (item) => {
  const price =
    Number(item?.product?.price || item?.product_variant?.price) || 0;
  const discountPercent =
    Number(
      item?.product?.discount_percent || item?.product_variant?.discount_percent
    ) || 0;

  // Calculate discounted price
  const discountedPrice = price - (price * discountPercent) / 100;

  return discountedPrice;
};
const MyOrder = () => {
  const nav = useNavigate();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(Cookies.get("user"));

  console.log("user", user);
  // Sử dụng hook scroll to top khi currentPage thay đổi
  useScrollToTop(currentPage);

  const selectedProduct =
    selectedOrder?.order_items?.[currentProductIndex] || null;
  const { submitReview } = useReview(
    selectedProduct?.product_id || selectedProduct?.product_variant?.product_id
  );

  const handleReviewSubmit = async () => {
    try {
      // Validate all forms first
      const values = form.getFieldsValue();
      const errors = [];

      selectedOrder.order_items.forEach((item, index) => {
        if (!values[`product_${index}_rating`]) {
          errors.push(`Vui lòng đánh giá sản phẩm ${item.product?.name}`);
        }
        if (!values[`product_${index}_comment`]) {
          errors.push(
            `Vui lòng nhập đánh giá cho sản phẩm ${item.product?.name}`
          );
        }
      });

      if (errors.length > 0) {
        message.error(errors.join("\n"));
        return;
      }

      // Submit all reviews
      const user = JSON.parse(Cookies.get("user"));
      const reviewPromises = selectedOrder.order_items.map((item, index) => {
        const productId = item.product_id || item.product_variant?.product_id;
        const reviewData = {
          images: user.avatar,
          title: user.name,
          rating: values[`product_${index}_rating`],
          comment: values[`product_${index}_comment`],
        };
        return instanceAxios.post(`/api/v1/customer/review`, {
          product_id: productId,
          ...reviewData,
        });
      });

      message.loading("Đang gửi đánh giá...", 0);
      await Promise.all(reviewPromises);
      message.destroy();
      message.success("Đã gửi đánh giá thành công");
      form.resetFields();
      setReviewModalVisible(false);
    } catch (error) {
      message.destroy();
      message.error("Có lỗi xảy ra khi gửi đánh giá");
      console.error(error);
    }
  };
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", currentPage],
    queryFn: async () => {
      const res = await instanceAxios.get(
        `/api/v1/customer/orders?page=${currentPage}`
      );
      return res?.data;
    },
  });

  console.log("orderData", apiResponse);

  // Truy cập đúng mảng đơn hàng từ cấu trúc phản hồi API
  const orders = apiResponse?.data?.data || [];
  const totalPages = apiResponse?.data?.last_page || 1;

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

    // Actions for PENDING orders
    if (order.status === ORDER_STATUS.PENDING) {
      actions.push("hủy");
    }

    // Actions for DELIVERED orders
    if (order.status === ORDER_STATUS.DELIVERED) {
      actions.push("Đã nhận hàng", "Hoàn trả");
    }

    // Actions for COMPLETED orders
    if (order.status === ORDER_STATUS.COMPLETED) {
      actions.push("đánh giá", "mua lại", "Hoàn trả");

      // Check if within 7 days for return request
      const completedDate = new Date(order.updated_at);
      const now = new Date();
      const diffInDays = (now - completedDate) / (1000 * 60 * 60 * 24);

      if (diffInDays <= 7) {
        actions.push("yêu cầu trả hàng");
      }
    }

    // Actions for CANCELLED orders
    if (order.status === ORDER_STATUS.CANCELLED) {
      actions.push("mua lại");
    }

    // Actions for RETURN_REQUESTED orders
    if (order.status === ORDER_STATUS.RETURN_REQUESTED) {
      actions.push("hủy yêu cầu trả hàng");
    }

    // Actions for RETURN_PROCESSING orders
    if (order.status === ORDER_STATUS.RETURN_PROCESSING) {
      actions.push("xem trạng thái trả hàng");
    }

    // Actions for RETURNED_COMPLETED orders
    if (order.status === ORDER_STATUS.RETURNED_COMPLETED) {
      actions.push("mua lại");
    }

    // Actions for RETURN_REJECTED orders
    if (order.status === ORDER_STATUS.RETURN_REJECTED) {
      actions.push("mua lại");
    }

    return actions;
  };

  const handleAction = async (action, order) => {
    console.log("order", order);
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
          setLoading(true);
          try {
            if (!order?.id) {
              throw new Error("Không tìm thấy ID đơn hàng");
            }

            const response = await instanceAxios.put(
              `/api/v1/order/${order.id}/status`,
              {
                status: ORDER_STATUS.CANCELLED,
                id: user.customerId,
              }
            );

            if (response.data?.success) {
              message.success("Đã hủy đơn hàng thành công");
              window.location.reload();
            } else {
              throw new Error(
                response.data?.message || "Không thể hủy đơn hàng"
              );
            }
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            if (error.response?.status === 404) {
              message.error("Không tìm thấy đơn hàng");
            } else if (error.response?.status === 403) {
              message.error("Bạn không có quyền thực hiện thao tác này");
            } else {
              message.error(
                error.response?.data?.message ||
                  error.message ||
                  "Không thể hủy đơn hàng"
              );
            }
          } finally {
            setLoading(false);
          }
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
                  price: Number(item.price),
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
          setLoading(true);
          try {
            if (!order?.id) {
              throw new Error("Không tìm thấy ID đơn hàng");
            }

            const response = await instanceAxios.put(
              `/api/v1/order/${order.id}/status`,
              {
                status: ORDER_STATUS.COMPLETED,
                id: user.customerId,
              }
            );

            if (response.data?.success) {
              message.success("Đã xác nhận nhận hàng thành công");
              setConfirmModalVisible(false);
              window.location.reload();
            } else {
              throw new Error(
                response.data?.message || "Không thể xác nhận nhận hàng"
              );
            }
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            if (error.response?.status === 404) {
              message.error("Không tìm thấy đơn hàng");
            } else if (error.response?.status === 403) {
              message.error("Bạn không có quyền thực hiện thao tác này");
            } else {
              message.error(
                error.response?.data?.message ||
                  error.message ||
                  "Không thể xác nhận nhận hàng"
              );
            }
          } finally {
            setLoading(false);
          }
          break;

        case "Hoàn trả":
          setLoading(true);
          try {
            if (!order?.id) {
              throw new Error("Không tìm thấy ID đơn hàng");
            }

            const response = await instanceAxios.put(
              `/api/v1/order/${order.id}/status`,
              {
                status: ORDER_STATUS.RETURN_REQUESTED,
                id: user.customerId,
              }
            );

            if (response.data?.success) {
              message.success("Đã gửi yêu cầu hoàn trả");
              window.location.reload();
            } else {
              throw new Error(
                response.data?.message || "Không thể gửi yêu cầu hoàn trả"
              );
            }
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            if (error.response?.status === 404) {
              message.error("Không tìm thấy đơn hàng");
            } else if (error.response?.status === 403) {
              message.error("Bạn không có quyền thực hiện thao tác này");
            } else {
              message.error(
                error.response?.data?.message ||
                  error.message ||
                  "Không thể gửi yêu cầu hoàn trả"
              );
            }
          } finally {
            setLoading(false);
          }
          break;

        case "yêu cầu trả hàng":
          setLoading(true);
          try {
            await instanceAxios.put(`/api/v1/order/${order.id}/status`, {
              status: ORDER_STATUS.RETURN_REQUESTED,
              id: user.customerId,
            });
            message.success("Đã gửi yêu cầu trả hàng");
            window.location.reload();
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            message.error(
              error.response?.data?.message || "Không thể gửi yêu cầu trả hàng"
            );
          } finally {
            setLoading(false);
          }
          break;

        case "hủy yêu cầu trả hàng":
          setLoading(true);
          try {
            await instanceAxios.put(`/api/v1/order/${order.id}/status`, {
              status: ORDER_STATUS.COMPLETED,
              id: user.customerId,
            });
            message.success("Đã hủy yêu cầu trả hàng");
            window.location.reload();
          } catch (error) {
            console.error("Chi tiết lỗi:", error);
            message.error(
              error.response?.data?.message || "Không thể hủy yêu cầu trả hàng"
            );
          } finally {
            setLoading(false);
          }
          break;

        case "xem trạng thái trả hàng":
          nav(`/my-profile/orders/${order.order_code}`);
          break;

        default:
          console.log(`Hành động chưa xử lý: ${action}`);
      }
    } catch (error) {
      console.error("Error handling action:", error);
      message.error("Có lỗi xảy ra khi thực hiện hành động");
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonOrder />
          <SkeletonOrder />
        </>
      ) : (
        <div className="dark:bg-gray-800 min-h-screen p-6">
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
                  <div>
                    {orders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-3 border hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                      >
                        <OrderItem
                          order_items={order.order_items}
                          status={order.status}
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
                              {/* {FomatVND(
                                (order?.order_items || []).reduce(
                                  (total, item) =>
                                    total + calculateSubtotal(item),
                                  0
                                )
                              )} */}
                              {FomatVND(order?.subtotal)}
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
                                disabled={loading}
                              >
                                {loading ? "Đang xử lý..." : action}
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
                disabled={loading}
              >
                Hủy
              </button>,
              <button
                key="confirm"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleAction("confirmReceived", selectedOrder)}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
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
                  Bạn có thể yêu cầu hoàn trả hàng trong vòng 7 ngày kể từ ngày
                  nhận hàng. Sau thời gian này, chúng tôi sẽ không thể xử lý yêu
                  cầu hoàn trả của bạn.
                </p>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default MyOrder;
