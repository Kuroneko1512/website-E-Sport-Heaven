import { getOrders, Order, Pagination } from "@app/services/OrderReturn/Api";
import FomatVND from "@app/utils/FomatVND";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ORDER_STATUS, ORDER_STATUS_LABELS, PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@app/constants/OrderConstants";
const OrderReturn: FC = () => {
     const navigate = useNavigate();
    
        // State lưu thông tin phân trang
        const [pagination, setPagination] = useState<Pagination>({
            current_page: 1,
            last_page: 1,
            prev_page_url: null,
            next_page_url: null,
            total: 0,
            per_page: 5,
            data: [],
        });
    
        // State lưu danh sách đơn hàng
        const [orders, setOrders] = useState<Order[]>([]);
        const [loading, setLoading] = useState(false);
    
        // Hàm lấy dữ liệu đơn hàng từ API
        const fetchData = async (page = 1) => {
            setLoading(true);
            try {
                const response = await getOrders(page, pagination.per_page);
                console.log("API Response:", response);
    
                setOrders(response.data); // Gán danh sách orders
                setPagination(response); // Cập nhật thông tin phân trang
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
            setLoading(false);
        };
    
        useEffect(() => {
            fetchData();
        }, []);
    
    return (
    <section className="content">
        <div className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1>Danh sách đơn hàng</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-right">
                            <li className="breadcrumb-item">
                                <Link to={"/"}>Trang chủ</Link>
                            </li>
                            <li className="breadcrumb-item active">Đơn hàng</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Đơn hàng</h3>
                <div className="card-tools">
                    <Link to="/add-product" className="btn btn-success me-2">
                        + Thêm
                    </Link>
                </div>
            </div>

            <div className="card-body p-0">
                <table className="table table-hover text-nowrap">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Giá</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Số lượng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                                    <tr key={order.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{order.customer_name}</strong> <br />
                                            <small>{order.customer_email}</small> <br />
                                            <small>{order.customer_phone}</small>
                                        </td>
                                        <td>{order.order_code}</td>
                                        <td>{FomatVND(order.total_amount)}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString("vi-VI")}
                                        </td>
                                        <td>
                                            <span className={`badge ${order.payment_status === PAYMENT_STATUS.PAID ? "badge-success" : "badge-warning"}`}>
                                                {PAYMENT_STATUS_LABELS[order.payment_status]}
                                            </span>
                                        </td>
                                        <td className="project-state">
                                            <span className={`badge ${ order.status === ORDER_STATUS.COMPLETED ? "badge-success" : "badge-warning"}`}>
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td className="project-actions text-right">
                                            <Link className="btn btn-primary btn-sm" to={`/order-return/${order.id}`}>
                                                <i className="fas fa-folder"></i> Xem
                                            </Link>
                                        </td>

                                    </tr>
                                ))}
                      
                    </tbody>
                           
                </table>

            </div>
        </div>
    </section>
    );
};

export default OrderReturn;
