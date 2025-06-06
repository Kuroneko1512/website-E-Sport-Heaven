import { getOrders, Order, Pagination } from "@app/services/Order/Api";
import FomatVND from "@app/utils/FomatVND";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

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
import Echo from "laravel-echo";
import io from "socket.io-client";
import useEchoChannel from "@app/hooks/useEchoChannel";

interface ApiResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  total: number;
  per_page: number;
}

const Orders = () => {
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 10,
    data: [],
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setPagination({ ...pagination, current_page: page });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchData(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = 5;
    let startPage = Math.max(
      1,
      pagination.current_page - Math.floor(maxPages / 2)
    );
    let endPage = Math.min(pagination.last_page, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await getOrders(
          page,
          pagination.per_page,
          "customer",
          searchTerm
        );
        const apiResponse = response as unknown as ApiResponse;
        setOrders(apiResponse.data.data);
        console.log(apiResponse.data);

        setPagination((prev) => ({
          ...prev,
          current_page: apiResponse.data.current_page,
          last_page: apiResponse.data.last_page,
          prev_page_url: apiResponse.data.prev_page_url,
          next_page_url: apiResponse.data.next_page_url,
          total: apiResponse.data.total,
          per_page: apiResponse.data.per_page,
          data: apiResponse.data.data,
        }));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
      setLoading(false);
    },
    [pagination.per_page, searchTerm]
  );

  useEffect(() => {
    fetchData(pagination.current_page);
  }, [pagination.current_page]);

  // realtime
  const handleOrderCreate = useCallback((event: any) => {
    console.log("✅ Event nhận được:", event);
    fetchData(pagination.current_page);
  }, [fetchData, pagination.current_page]);

  // Sử dụng hook useEchoChannel
  useEchoChannel(
    'order.2',  // Tên kênh
    '.order-create',  // Tên sự kiện
    handleOrderCreate  // Callback function
  );
  // realtime lỗi
  // window.io = io;
  // window.echo = new Echo({
  //   broadcaster: "socket.io",
  //   host: "127.0.0.1:6001",
  //   transports: ["websocket"],
  //   forceTLS: false,
  // });
  // window.echo
  //   .channel("order.2")
  //   .subscribed(() => console.log("✅ Đã subscribe channel orders.2"))
  //   .listen(".order-create", (e) => {
  //     console.log("✅ Event nhận được:", e);
  //     fetchData(pagination.current_page);
  //   });

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
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo mã, tên hoặc mô tả..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                aria-label="Tìm kiếm"
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search me-1"></i> Tìm kiếm
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearSearch}
                  >
                    <i className="fas fa-times me-1"></i> Xóa
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Đơn hàng</h3>
          <div className="card-tools">
            <button
              type="button"
              className="btn btn-tool"
              data-card-widget="collapse"
              title="Collapse"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              type="button"
              className="btn btn-tool"
              data-card-widget="remove"
              title="Remove"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="overlay h-[30rem]">
              <div className="spinner-border text-primary" role="status"></div>
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
                  <th>Kiểu Thanh Toán</th>
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
                    <td>
                      {new Date(order.created_at).toLocaleDateString("vi-VI")}
                    </td>
                    <td className="">
                      <span
                        className={`badge ${PAYMENT_METHOD_STYLES[order.payment_method] || 'badge-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                      >
                        {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${PAYMENT_STATUS_STYLES[order.payment_status]}`}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="project-state text-center">
                      <span
                        className={`badge ${ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="project-actions text-right">
                      <Link
                        className="btn btn-primary btn-sm"
                        to={`Details/${order.id}`}
                      >
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
              <li
                className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(1)}
                  aria-label="Trang đầu"
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li
                className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(pagination.current_page - 1)}
                  aria-label="Trang trước"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
              </li>

              {renderPageNumbers().map((number) => (
                <li
                  key={number}
                  className={`page-item ${pagination.current_page === number ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(number)}
                  >
                    {number}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${pagination.current_page === pagination.last_page ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(pagination.current_page + 1)}
                  aria-label="Trang sau"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
              </li>
              <li
                className={`page-item ${pagination.current_page === pagination.last_page ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(pagination.last_page)}
                  aria-label="Trang cuối"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchData(pagination.current_page)}
          >
            <i className="fas fa-sync-alt me-1"></i> Làm mới
          </button>
        </div>
      </div>
    </section>
  );
};

export default Orders;
