import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "@app/services/Order/Api";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_STYLES
} from "@app/constants/OrderConstants";

import { debounce } from 'lodash';
import useEchoChannel from "@app/hooks/useEchoChannel";

// Định nghĩa kiểu dữ liệu cho đơn hàng

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product_image?: string;
  product_name?: string;
  product_sku?: string;
  product?: {
    name: string;
    image?: string;
  };
  product_variant?: {
    sku: string;
  };
}

interface History {
  id: number;
  actor_name: string;
  action_type: number;
  actor_role: string;
  created_at: string;
  order_status: string;
  notes: string;
  metadata: any;
}

interface Order {
  id: number;
  order_code: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  customer_note: string;
  admin_note: string;
  cancel_reason: string;
  cancelled_by: string;
  total_amount: string;
  subtotal: string;
  tax_amount?: string;
  shipping_fee?: string;
  status: number;
  payment_status: number;
  payment_method: string;
  payment_transaction_id?: string;
  tracking_number?: string;
  created_at: string;
  paid_at?: string;
  history: History[];
  order_items: OrderItem[];
}

const statusList = [
  ORDER_STATUS.PENDING,        // 0
  ORDER_STATUS.CONFIRMED,      // 1
  ORDER_STATUS.PREPARING,      // 2
  ORDER_STATUS.READY_TO_SHIP,  // 3
  ORDER_STATUS.SHIPPING,       // 4
  ORDER_STATUS.DELIVERED,      // 5
];

const FomatVND = (amount: number | string): string => {
  const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numberAmount.toLocaleString('vi-VN', { minimumFractionDigits: 0 }) + ' VND';
};

const DetailOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isManualUpdate, setIsManualUpdate] = useState<boolean>(false);
  const currentStatusIndex = order ? statusList.indexOf(order.status) : -1;
  const nextStatusLabel = (currentStatusIndex >= 0 && currentStatusIndex < statusList.length - 1)
    ? ORDER_STATUS_LABELS[statusList[currentStatusIndex + 1]]
    : "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(Number(id));
      setOrder(response.data.data as Order);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
    setLoading(false);
  };

  // Debounced version của fetchData để tránh gọi API quá nhiều lần
  const debouncedFetchData = useCallback(
    debounce(() => {
      if (!isManualUpdate) {
        console.log('🔄 Real-time: Đang cập nhật dữ liệu đơn hàng...');
        fetchData();
      }
    }, 500),
    [isManualUpdate]
  );

  // Handler cho real-time updates
  const handleOrderUpdate = useCallback((event) => {
    console.log('✅ Nhận được cập nhật trạng thái đơn hàng:', event);

    if (!isManualUpdate) {
      debouncedFetchData();
    } else {
      console.log('⏸️ Bỏ qua cập nhật real-time do đang thực hiện cập nhật thủ công');
    }
  }, [debouncedFetchData, isManualUpdate]);

  // Sử dụng hook useEchoChannel
  const { connected, error: echoError, socketId, isSubscribed } = useEchoChannel(
    'orders.1',
    '.order-status-updated',
    handleOrderUpdate
  );

  useEffect(() => {
    fetchData();
  }, [id]);

  const nextStatus = async () => {
    if (!order) return;
    const confirmUpdate = window.confirm("Bạn có chắc muốn chuyển sang trạng thái tiếp theo?");
    if (!confirmUpdate) return;

    const currentIndex = statusList.indexOf(order.status);
    if (currentIndex < statusList.length - 1) {
      const newStatus = statusList[currentIndex + 1];

      // THÊM: Đặt flag để ngăn real-time update
      setIsManualUpdate(true);

      try {
        await updateOrderStatus(Number(id), newStatus);
        console.log('✅ Cập nhật thủ công thành công');

        const updatedOrderResponse = await getOrderById(Number(id));
        setOrder(updatedOrderResponse.data.data);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
      } finally {
        // THÊM: Reset flag sau 2 giây
        setTimeout(() => {
          setIsManualUpdate(false);
          console.log('🔄 Đã bật lại real-time updates');
        }, 2000);
      }
    }
  };

  const failDelivery = async () => {
    if (!order) return;
    const confirmCancel = window.confirm("Bạn có chắc muốn huỷ đơn hàng này?");
    if (!confirmCancel) return;

    // THÊM: Đặt flag để ngăn real-time update
    setIsManualUpdate(true);

    try {
      await updateOrderStatus(Number(id), ORDER_STATUS.CANCELLED);
      console.log('✅ Hủy đơn hàng thành công');
      setOrder({ ...order, status: ORDER_STATUS.CANCELLED });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      // THÊM: Reset flag sau 2 giây
      setTimeout(() => {
        setIsManualUpdate(false);
        console.log('🔄 Đã bật lại real-time updates');
      }, 2000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chi tiết đơn hàng</h3>
        </div>
        <div className="card-body d-flex flex-wrap">
          {/* Thông tin khách hàng và trạng thái */}
          <div className="flex-fill" style={{ minWidth: "300px", paddingRight: "20px" }}>
            <h5>Thông tin khách hàng</h5>
            <p><strong>Khách hàng:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Điện thoại:</strong> {order.customer_phone}</p>
            <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
            {/* Trạng thái đơn hàng */}
            <p>
              <strong>Trạng thái:</strong>
              <span className={`badge ${ORDER_STATUS_STYLES[order.status] || 'badge-secondary'} ml-2`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </p>
            {/* Trạng thái thanh toán */}
            <p>
              <strong>Trạng thái thanh toán:</strong>
              <span className={`badge ${PAYMENT_STATUS_STYLES[order.payment_status] || 'badge-secondary'} ml-2`}>
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </span>
            </p>
            {/* Phương thức thanh toán */}
            <p>
              <strong>Phương thức thanh toán:</strong>
              <span className={`badge ${PAYMENT_METHOD_STYLES[order.payment_method] || 'badge-secondary'} ml-2`}>
                {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
              </span>
            </p>
          </div>
          {/* Thông tin tổng tiền, phí, ngày */}
          <div className="flex-fill" style={{ minWidth: "300px" }}>
            <h5>Thông tin thanh toán</h5>
            <p><strong>Tổng tiền:</strong> {FomatVND(parseFloat(order.total_amount))}</p>
            <p><strong>Phí vận chuyển:</strong> {FomatVND(parseFloat(order.shipping_fee || '0'))}</p>
            <p><strong>Mã đơn hàng:</strong> <b>{order.order_code}</b></p>
            <p><strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p>
              <strong>Ngày thanh toán:</strong> {order.paid_at ? new Date(order.paid_at).toLocaleString() : 'Chưa thanh toán'}
            </p>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-start">
          {/* Nút tiến trạng thái */}
          <button
            type="button"
            className="btn btn-primary mr-3"
            disabled={
              order.status === ORDER_STATUS.COMPLETED ||
              order.status === ORDER_STATUS.CANCELLED ||
              currentStatusIndex >= statusList.length - 1 ||
              !nextStatusLabel ||
              isManualUpdate // THÊM: Disable khi đang cập nhật thủ công
            }
            onClick={nextStatus}
          >
            {isManualUpdate ? "Đang cập nhật..." :
              nextStatusLabel ? `Chuyển sang : ${nextStatusLabel}` : "Không thể chuyển trạng thái"}
          </button>

          {/* Nút huỷ đơn */}
          <button
            type="button"
            className="btn btn-danger"
            disabled={
              order.status >= ORDER_STATUS.READY_TO_SHIP ||
              isManualUpdate // THÊM: Disable khi đang cập nhật thủ công
            }
            onClick={failDelivery}
          >
            {isManualUpdate ? "Đang cập nhật..." : "Huỷ đơn"}
          </button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Sản phẩm trong đơn hàng</h3>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Số lượng</th>
                  <th>Đơn Giá</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.length > 0 ? (
                  order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product_image ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${item.product_image}`}
                            alt={item.product?.name || "Product"}
                            width="50"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </td>
                      <td>{item.product_name}</td>
                      <td>{item.product_sku || "N/A"}</td>
                      <td>{item.quantity}</td>
                      <td>{FomatVND(item.price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Không có sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lịch sử hoạt động */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Lịch sử hoạt động</h3>
          </div>
          <div className="card-body">
            {order.history && order.history.length > 0 ? (
              <ul className="list-group list-group-flush">
                {order.history.map((entry) => (
                  <li key={entry.id} className="list-group-item">
                    <div>
                      <strong>{entry.actor_name}</strong> ({entry.actor_role}) - {new Date(entry.created_at).toLocaleString()}
                    </div>
                    <div>
                      <em>{entry.order_status}</em>
                    </div>
                    <div>{entry.notes}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có hoạt động nào</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailOrder;
