import { getOrders, Order, Pagination } from "@app/services/Order/Api";
import FomatVND from "@app/utils/FomatVND";
import { useEffect, useState, useCallback } from "react";
import {  Link } from "react-router-dom";

import { ORDER_STATUS, ORDER_STATUS_LABELS, PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@app/constants/OrderConstants";

const Orders = () => {
    

   
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        prev_page_url: null,
        next_page_url: null,
        total: 0,
        per_page: 5,
        data: [],
    });

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.last_page) {
         
            
            setPagination({ ...pagination, current_page: page });
        
            
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPages = 5;
        let startPage = Math.max(1, pagination.current_page - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.last_page, startPage + maxPages - 1);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // Hàm lấy dữ liệu đơn hàng từ API
    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await getOrders(page, pagination.per_page, 'customer');
            console.log(response.data);
            
            setOrders(response.data.data);
            setPagination((prev) => ({
                ...prev,
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                prev_page_url: response.data.prev_page_url,
                next_page_url: response.data.next_page_url,
                total: response.data.total,
                per_page: response.data.per_page,
                data: response.data.data
            }));
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
        setLoading(false);
    }, [pagination.per_page]);

    useEffect(() => {
        fetchData(pagination.current_page);
    }, [fetchData, pagination.current_page]);

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
                                    <a href="#">Trang chủ</a>
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
                        <div className="overlay h-[30rem]">
                            <div className="spinner-border text-primary" role="status">
                            </div>
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    ) : (
                        <table className="table table-striped projects">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Thông tin khách hàng</th>
                                    <th>Mã Đơn hàng</th>
                                    <th>Tổng Tiền</th>
                                    <th>Ngày đặt hàng</th>
                                    <th>Trạng Thái Thanh Toán</th>
                                    <th className="text-center">Trạng thái Đơn</th>

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
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                <div className="pagination">
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(1)} aria-label="Trang đầu">
                                                <i className="fas fa-angle-double-left"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(pagination.current_page - 1)} aria-label="Trang trước">
                                                <i className="fas fa-angle-left"></i>
                                            </button>
                                        </li>

                                        {renderPageNumbers().map(number => (
                                            <li key={number} className={`page-item ${pagination.current_page === number ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => goToPage(number)}>
                                                    {number}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(pagination.current_page + 1)} aria-label="Trang sau">
                                                <i className="fas fa-angle-right"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(pagination.last_page)} aria-label="Trang cuối">
                                                <i className="fas fa-angle-double-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <button className="btn btn-outline-primary" onClick={() => fetchData(pagination.current_page)}>
                                    <i className="fas fa-sync-alt me-1"></i> Làm mới
                                </button>
                            </div>
            </div>
        
        </section>
    );
};

export default Orders;
