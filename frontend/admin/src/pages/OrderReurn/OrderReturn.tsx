import { getOrders, UserReturn, Pagination } from "@app/services/OrderReturn/Api";
import FomatVND from "@app/utils/FomatVND";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_STYLES,
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS
} from "@app/constants/OrderConstants";

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
    const [orders, setOrders] = useState<UserReturn[]>([]);
    const [loading, setLoading] = useState(false);

    // Hàm lấy dữ liệu đơn hàng từ API
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getOrders(page, pagination.per_page);
            console.log("API Response:", response);
            // console.log("Response data:", response.data);
            // console.log("Response data.data:", response.data.data);

            setOrders(response.data.data ); // Gán danh sách orders
            setPagination(response); // Cập nhật thông tin phân trang
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);
    // Log để debug
    // console.log("Orders state:", orders);
    // console.log("Pagination state:", pagination);
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
                </div>

                <div className="card-body p-0">
                    <table className="table table-hover text-nowrap">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mã đơn hàng</th>
                                <th>Tổng tiền</th>
                                <th>Ngày tạo phiếu</th>
                                <th>Trạng thái xử lý</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((userReturn, index) => (
                                <tr key={userReturn.id}>
                                    <td>{userReturn.id}</td>
                                    <td>{userReturn.order.order_code}</td>
                                    <td>{Number(userReturn.order.total_amount).toLocaleString()}₫</td>
                                    <td>{new Date(userReturn.created_at).toLocaleDateString()}</td>
                                    <td className="project-state">
                                        <span className={`badge ${ORDER_STATUS_STYLES[userReturn.order.status]}`}>
                                            {ORDER_STATUS_LABELS[userReturn.order.status]}
                                        </span>
                                    </td>
                                    <td>
                                        <Link className="btn btn-primary btn-sm" to={`/order-return/${userReturn.order.id}`}>
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
