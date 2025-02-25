import { getOrders, Order, Pagination } from "@app/services/Order/Api";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Orders = () => {
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
                                    <a href="#">Home</a>
                                </li>
                                <li className="breadcrumb-item active">Orders</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Orders</h3>
                    <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse" title="Collapse">
                            <i className="fas fa-minus"></i>
                        </button>
                        <button type="button" className="btn btn-tool" data-card-widget="remove" title="Remove">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="table table-striped projects">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Thông tin khách hàng</th>
                                    <th>Mã Đơn hàng</th>
                                    <th>Tổng Tiền</th>
                                    <th className="text-center">Trạng thái</th>

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
                                        <td>{order.total_amount} VND</td>
                                        <td className="project-state">
                                            <span className={`badge ${order.status === "success" ? "badge-success" : "badge-warning"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="project-actions text-right">
                                            <Link className="btn btn-primary btn-sm" to={`Details/${order.id}`}>
                                                <i className="fas fa-folder"></i> Xem
                                            </Link>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Orders;
