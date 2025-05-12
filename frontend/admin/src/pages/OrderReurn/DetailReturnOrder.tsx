import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderReturnById, updateOrderStatus } from "@app/services/OrderReturn/Api";
import { ORDER_STATUS, ORDER_STATUS_LABELS, PAYMENT_STATUS, PAYMENT_STATUS_LABELS, ORDER_REASON_LABELS, ORDER_REASON } from "@app/constants/OrderConstants";

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

interface OrderReturn {
  id: number;
  order_id: number;
  order_item_id: number | null;
  reason: number;
  description?: string;
  image?: string;
  video?: string;
  refund_bank_account?: string;
  refund_bank_name?: string;
  refund_bank_customer_name?: string;
  refund_amount?: number;
  refunded_at?: string;
  status: number;
  created_at: string;
  order_status: number;
  
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
// const reasonList = [
//   ORDER_REASON.PRODUCT_DEFECT,
//   ORDER_REASON.WRONG_ITEM,
//   ORDER_REASON.CUSTOMER_CHANGE_MIND,
//   ORDER_REASON.LATE_DELIVERY,
//   ORDER_REASON.OTHER
// ];

const DetailReturnOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderReturn | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getOrderReturnById(Number(id));
      console.log(response.data.data);
      setOrder(response.data.data as OrderReturn);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const acceptReturnRequest = async () => {
    if (!order) return;
    const confirmAccept = window.confirm("Chấp nhận yêu cầu trả hàng?");
    if (!confirmAccept) return;

    try {
      await updateOrderStatus(Number(id), ORDER_STATUS.RETURN_PROCESSING);
      const updatedOrderResponse = await getOrderReturnById(Number(id));
      setOrder(updatedOrderResponse.data.data);
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu trả hàng:", error);
    }
  };
  const completeReturnOrder = async () => {
  if (!order) return;
  const confirmComplete = window.confirm("Xác nhận hoàn tất trả hàng?");
  if (!confirmComplete) return;

  try {
    // Cập nhật trạng thái thành "Hoàn thành trả hàng"
    await updateOrderStatus(Number(id), ORDER_STATUS.RETURNED_COMPLETED);
    const updatedOrderResponse = await getOrderReturnById(Number(id));
    setOrder(updatedOrderResponse.data.data);
  } catch (error) {
    console.error("Lỗi khi hoàn tất trả hàng:", error);
  }
};

  const rejectReturnRequest = async () => {
    if (!order) return;
    const confirmReject = window.confirm("Từ chối yêu cầu trả hàng?");
    if (!confirmReject) return;

    try {
      await updateOrderStatus(Number(id), ORDER_STATUS.RETURN_REJECTED);
      const updatedOrderResponse = await getOrderReturnById(Number(id));
      setOrder(updatedOrderResponse.data.data);
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu trả hàng:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chi tiết yêu cầu đổi/trả</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Cột trái: Lý do và mô tả */}
            <div className="col-md-6">
              <h5 className="mb-3">Thông tin yêu cầu</h5>
              <p><strong>Lý do:</strong> {ORDER_REASON_LABELS[order.reason] || "Không xác định"}</p>
              <p><strong>Mô tả:</strong> {order.description || 'Không có mô tả'}</p>

              {order.image && (
                <div className="mb-3">
                  <strong>Ảnh minh họa:</strong><br />
                  <img
                    src={`http://127.0.0.1:8000/storage/${order.image}`}
                    width="100%"
                    style={{ maxWidth: "250px", borderRadius: "8px", border: "1px solid #ccc" }}
                    alt="Ảnh minh họa"
                  />
                </div>
              )}
            </div>

            {/* Cột phải: Thông tin hoàn tiền */}
            <div className="col-md-6">
              <h5 className="mb-3">Thông tin hoàn tiền</h5>
              <p><strong>Ngân hàng:</strong> {order.refund_bank_name}</p>
              <p><strong>Tên chủ tài khoản:</strong> {order.refund_bank_customer_name}</p>
              <p><strong>Số tài khoản:</strong> {order.refund_bank_account}</p>
              <p><strong>Số tiền hoàn:</strong> {order.refund_amount?.toLocaleString()} VND</p>
            </div>

          </div>
          {order?.order_status === 7 && (
         <>
                  <button className="btn btn-success mr-2" onClick={acceptReturnRequest}>
                   Chấp nhận hoàn hàng
                  </button>

                  <button className="btn btn-danger" onClick={rejectReturnRequest}>
                   Từ chối hoàn hàng
                  </button>
                </>
           )} 
               {order?.order_status === 8 && (
         <>
                  <button className="btn btn-success mr-2" onClick={completeReturnOrder}>
                  Hoàn thành hoàn hàng
                  </button>

                 
                </>
           )} 

        </div>
      </div>

    </section>

  );
};

export default DetailReturnOrder;
