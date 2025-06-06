import { FC, useEffect, useState } from "react";
import { deleteCoupon, getCoupons, Coupon as ApiCoupon } from "@app/services/Coupon/ApiCoupon";
import { Link, useNavigate } from "react-router-dom";

interface CouponDisplay {
    id: number;
    code: string;
    name: string;
    description: string;
    discount_value: number;
    discount_type: number;
    min_order_amount : number;
    max_discount_amount : number;
    is_active: number;
    start_date: string;
    end_date: string;
    max_uses: number;
    user_id : number;
}

const Coupon: FC = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<CouponDisplay[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const fetchCoupons = async (page: number = 1, search: string = searchTerm) => {
        try {
            setLoading(true);
            const response = await getCoupons(page, perPage, search);
            console.log("API response:", response);

            setCurrentPage(response.current_page);
            setLastPage(response.last_page);
            setTotal(response.total);

            const formattedCoupons = response.data.map((item: ApiCoupon) => ({
                id: item.id,
                code: item.code,
                name: item.name,
                description: item.description || '',
                discount_value: item.discount_value,
                discount_type: item.discount_type,
                min_order_amount: item.min_order_amount || 0,
                max_discount_amount: item.max_discount_amount || 0,
                is_active: item.is_active,
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                max_uses: item.max_uses || 0,
            }));
            setCoupons(formattedCoupons);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setCurrentPage(1);
        fetchCoupons(1, searchTerm);
    };

    const handleDeleteCoupon = async (id: number) => {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa không?");
        if (confirm) {
            try {
                await deleteCoupon(id);
                fetchCoupons(currentPage);
            } catch (error) {
                console.error("Error deleting coupon:", error);
            }
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchCoupons(1, '');
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
            fetchCoupons(page);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

  

    useEffect(() => {
        fetchCoupons();
    }, []);

    return (
        <section className="content">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Danh sách mã giảm giá</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Trang chủ</Link>
                                </li>
                                <li className="breadcrumb-item active">Mã giảm giá</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-tools">
                        <Link to="/add-coupon" className="btn btn-success me-2">
                            + Thêm
                        </Link>
                    </div>
                </div>

                <div className="card-header bg-light border-bottom">
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

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Đang tải...</div>
                    ) : (
                        <>
                            <table className="table table-hover text-nowrap">
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Tên</th>
                                        <th>Loại</th>
                                        <th>Ngày bắt đầu</th>
                                        <th>Ngày kết thúc</th>
                                        <th>Trạng thái</th>
                                        <th>Số lượt sử dụng</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.length > 0 ? (
                                        coupons.map((coupon) => (
                                            <tr key={coupon.id}>
                                                <td>{coupon.code}</td>
                                                <td>{coupon.name}</td>
                                                <td>{coupon.discount_type === 0 ? 'Phần trăm' : 'Giá tiền'}</td>
                                                <td>{formatDate(new Date(coupon.start_date))}</td>
                                                <td>{coupon.end_date ? formatDate(new Date(coupon.end_date)) : ''}</td>
                                                <td>
                                                    <span className={`tag ${coupon.is_active === 0 ? "tag-success" : "tag-danger"}`}>
                                                        {coupon.is_active === 0 ? "Hoạt động" : "Ngừng"}
                                                    </span>
                                                </td>
                                                <td>{coupon.max_uses}</td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => navigate(`/detail-coupon/${coupon.id}`)}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => navigate(`/edit-coupon/${coupon.id}`)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                {searchTerm ? (
                                                    <>
                                                        <p className="text-muted">
                                                            Không tìm thấy mã giảm giá nào phù hợp với "{searchTerm}"
                                                        </p>
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={handleClearSearch}
                                                        >
                                                            Xóa tìm kiếm
                                                        </button>
                                                    </>
                                                ) : (
                                                    "Không có dữ liệu"
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                <div className="pagination">
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(1)} aria-label="Trang đầu">
                                                <i className="fas fa-angle-double-left"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(currentPage - 1)} aria-label="Trang trước">
                                                <i className="fas fa-angle-left"></i>
                                            </button>
                                        </li>

                                        {renderPageNumbers().map(number => (
                                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => goToPage(number)}>
                                                    {number}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(currentPage + 1)} aria-label="Trang sau">
                                                <i className="fas fa-angle-right"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(lastPage)} aria-label="Trang cuối">
                                                <i className="fas fa-angle-double-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <button className="btn btn-outline-primary" onClick={() => fetchCoupons(currentPage, searchTerm)}>
                                    <i className="fas fa-sync-alt me-1"></i> Làm mới
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Coupon;
