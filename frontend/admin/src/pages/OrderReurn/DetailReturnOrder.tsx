import React, { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import {
  getOrderReturnById,
  updateOrderStatus,
} from "@app/services/OrderReturn/Api";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_REASON_LABELS, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES, PAYMENT_METHOD_STYLES, PAYMENT_METHOD_LABELS,
} from "@app/constants/OrderConstants";
import { OrderReturn } from "./types";          // tách các interface ra file riêng cho gọn

const DetailReturnOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orderReturn, setOrderReturn] = useState<OrderReturn | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------- LẤY DỮ LIỆU ---------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getOrderReturnById(Number(id));
        setOrderReturn(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* ---------------------- HÀM CẬP NHẬT TRẠNG THÁI ---------------------- */
  const changeOrderStatus = async (status: number, confirmMsg: string) => {
    if (!orderReturn) return;
    if (!window.confirm(confirmMsg)) return;

    try {
      // chú ý: truyền order_id (id của đơn hàng gốc)
      await updateOrderStatus(orderReturn.order_id, status);
      const updated = await getOrderReturnById(Number(id));
      setOrderReturn(updated.data.data);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!orderReturn) return <p>Không tìm thấy yêu cầu.</p>;

  /* -------------------------------------------------------- */
  const { order } = orderReturn; // dễ gõ hơn
  const FomatVND = (amount: number | string): string => {
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numberAmount.toLocaleString('vi-VN', { minimumFractionDigits: 0 }) + ' VND';
  };

  return (
    <>
      {/* ---------- THÔNG TIN ĐƠN HÀNG GỐC ---------- */}
      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chi tiết đơn hàng</h3>
          </div>
          {/* Thông tin khách hàng và thanh toán */}
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
        </div>
      </section>

      {/* ---------- THÔNG TIN YÊU CẦU ĐỔI / TRẢ ---------- */}
      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chi tiết yêu cầu đổi / trả</h3>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              {/* ==== Lý do & mô tả ==== */}
              <div className="col-md-6">
                <h5 className="mb-3">Thông tin yêu cầu</h5>
                <p><strong>Lý do:</strong>{" "}
                  {ORDER_REASON_LABELS[orderReturn.reason] ?? "Không xác định"}
                </p>
                <p><strong>Mô tả:</strong> {orderReturn.description || "—"}</p>

                {/* ---------- Ảnh minh hoạ (nhiều) ---------- */}
                {!!orderReturn.images.length && (
                  <Fragment>
                    <strong>Ảnh minh họa:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {orderReturn.images.map((img) => (
                        <img
                          key={img.id}
                          src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                          alt="return"
                          style={{ width: 120, borderRadius: 6 }}
                        />
                      ))}
                    </div>
                  </Fragment>
                )}
              </div>

              {/* ==== Thông tin hoàn tiền ==== */}
              <div className="col-md-6 ">
                <h5 className="mb-3">Thông tin hoàn tiền</h5>
                <p><strong>Ngân hàng:</strong> {orderReturn.refund_bank_name}</p>
                <p><strong>Chủ TK:</strong> {orderReturn.refund_bank_customer_name}</p>
                <p><strong>Số TK:</strong> {orderReturn.refund_bank_account}</p>
                <p>
                  <strong>Số tiền hoàn:</strong>{" "}
                  {Number(orderReturn.refund_amount ?? 0).toLocaleString()} VND
                </p>
              </div>
            </div>

            {/* ---------- NÚT HÀNH ĐỘNG ---------- */}
            {orderReturn.order_status === ORDER_STATUS.RETURN_REQUESTED && (
              <Fragment>
                <button
                  className="btn btn-success mr-2"
                  onClick={() =>
                    changeOrderStatus(
                      ORDER_STATUS.RETURN_PROCESSING,
                      "Chấp nhận hoàn hàng?"
                    )
                  }
                >
                  Chấp nhận hoàn hàng
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    changeOrderStatus(
                      ORDER_STATUS.RETURN_REJECTED,
                      "Từ chối hoàn hàng?"
                    )
                  }
                >
                  Từ chối hoàn hàng
                </button>
              </Fragment>
            )}

            {orderReturn.order_status === ORDER_STATUS.RETURN_PROCESSING && (
              <button
                className="btn btn-success"
                onClick={() =>
                  changeOrderStatus(
                    ORDER_STATUS.RETURNED_COMPLETED,
                    "Xác nhận đã hoàn tất hoàn hàng?"
                  )
                }
              >
                Hoàn thành hoàn hàng
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default DetailReturnOrder;
