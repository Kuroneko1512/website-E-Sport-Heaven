import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "@app/services/Order/Api";

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
  status: string;
  order_items: OrderItem[];
}

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
    const statusList = ["đang xử lý", "đã xác nhận", "đang giao", "hoàn thành"];
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
      await updateOrderStatus(Number(id), "đã hủy");
      setOrder({ ...order, status: "đã hủy" });
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
              <p><strong>Trạng thái:</strong> <span className="badge badge-info">{order.status}</span></p>

              {/* Nút cập nhật trạng thái */}
              <button className="btn btn-success mr-2"  onClick={nextStatus}>
                Tiến đến trạng thái tiếp theo
              </button>
              <button className="btn btn-danger" onClick={failDelivery}>
                Giao hàng thất bại
              </button>
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
                            <img src={item.product.image} alt={item.product.name} width="50" />
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
