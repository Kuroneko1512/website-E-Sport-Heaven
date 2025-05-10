import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "@app/services/Order/Api";
import { ORDER_STATUS, ORDER_STATUS_LABELS ,PAYMENT_STATUS_LABELS} from "@app/constants/OrderConstants";

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image?: string;
  };
  product_variant?: {
    sku: string;
  };
}

interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: number;
  payment_status: number;
  order_items: OrderItem[];
}

const statusList = [
  ORDER_STATUS.PENDING,        // 0
  ORDER_STATUS.CONFIRMED,      // 1
  ORDER_STATUS.PREPARING,      // 2
  ORDER_STATUS.READY_TO_SHIP,  // 3
  ORDER_STATUS.SHIPPING,       // 4
  ORDER_STATUS.DELIVERED,      // 5
  ORDER_STATUS.COMPLETED       // 6
];

const DetailOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      try {
        await updateOrderStatus(Number(id), newStatus);
        setOrder({ ...order, status: newStatus });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
      }
    }
  };

  const failDelivery = async () => {
    if (!order) return;
    const confirmCancel = window.confirm("Bạn có chắc muốn đánh dấu đơn hàng là thất bại?");
    if (!confirmCancel) return;
    try {
      await updateOrderStatus(Number(id), ORDER_STATUS.CANCELLED); // Truyền giá trị số 10
      setOrder({ ...order, status: ORDER_STATUS.CANCELLED });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
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
        <div className="card-body">
          <div className="row">
            {/* Cột thông tin đơn hàng */}
            <div className="col-lg-4">
              <h4>Thông tin đơn hàng</h4>
              <p><strong>Mã đơn hàng:</strong> {order.order_code}</p>
              <p><strong>Khách hàng:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Điện thoại:</strong> {order.customer_phone}</p>
              <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
              <p><strong>Tổng tiền:</strong> {order.total_amount} VND</p>
              <p><strong>Trạng thái thanh toán:</strong> <span className="badge badge-info">{PAYMENT_STATUS_LABELS[order.payment_status]}</span></p>

              <p><strong>Trạng thái:</strong> <span className="badge badge-info">{ORDER_STATUS_LABELS[order.status]}</span></p>

              {/* Nút cập nhật trạng thái */}
              {order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.CANCELLED && (
                <>
                  <button className="btn btn-success mr-2" onClick={nextStatus}>
                    Tiến đến trạng thái tiếp theo
                  </button>

                  <button className="btn btn-danger" onClick={failDelivery}>
                    Giao hàng thất bại
                  </button>
                </>
              )}
            </div>

            {/* Cột danh sách sản phẩm */}
            <div className="col-lg-8">
              <h4>Sản phẩm trong đơn hàng</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Biến thể</th>
                    <th>Số lượng</th>

                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.product?.image && (
                            <img src={`http://127.0.0.1:8000/storage/${item.product.image}`} alt={item.product.name} width="50" />
                          )}
                        </td>
                        <td>{item.product?.name || "Không có dữ liệu"}</td>
                        <td>{item.product_variant?.sku || "N/A"}</td>
                        <td>{item.quantity}</td>

                        <td>{item.price} VND</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">Không có sản phẩm nào trong đơn hàng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailOrder;
