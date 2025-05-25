import { useEffect, useState, FC } from 'react';
import { getCouponUsage, CouponUsage, deleteCouponUsage ,updateAmountCouponUsage} from '@app/services/Coupon/CouponUsage/ApiCouponUsage';
import {getCouponById} from"@app/services/Coupon/ApiCoupon";
import { Button, Modal, Input, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';

interface Coupon {
    id: number;
    name: string;
    code: string;
    discount_type: number;
    max_uses : number;
}

interface CouponUsageResponse {
    data: {
        data: {
            data: CouponUsage[];
        };
    };
    current_page: number;
    last_page: number;
    total: number;
}

const CouponUsageComponent: FC = () => {
    const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUsage, setEditingUsage] = useState<CouponUsage | null>(null);
    const [newAmount, setNewAmount] = useState<number>(0);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCouponUsage();
    }, [currentPage]);

    const fetchCouponUsage = async () => {
        try {
            setLoading(true);
            const response = await getCouponUsage();
            const data = response as unknown as CouponUsageResponse;
            setCouponUsages(data.data.data.data);
            setTotalPages(data.last_page);
       
        } catch (error) {
            console.error('Error fetching coupon usages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (!confirm) return;
        try {
            await deleteCouponUsage(id);
            fetchCouponUsage();
            alert('Xóa thành công');
        } catch (error) {
            console.error('Error deleting coupon usage:', error);
            alert('Xóa thất bại');
        }
    };

    const handleEdit = async (usage: CouponUsage) => {
        setEditingUsage(usage);
        setNewAmount(usage.amount);
        setIsEditModalVisible(true);
        
        try {
            const response = await getCouponById(usage.coupon_id);
           
            
            setCoupon(response);
        } catch (error) {
            console.error('Error fetching coupon:', error);
            message.error('Không thể lấy thông tin mã giảm giá');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUsage || !coupon) return;
        
        if (newAmount > coupon.max_uses) {
            message.error('Số lần sử dụng không được lớn hơn số lượng còn lại');
            return;
        }
        
        try {
            await updateAmountCouponUsage(editingUsage.id, newAmount);
            message.success('Cập nhật thành công');
            setIsEditModalVisible(false);
            setCoupon(null);
            fetchCouponUsage(); // Refresh lại dữ liệu
        } catch (error) {
            console.error('Error updating coupon usage:', error);
            message.error('Cập nhật thất bại');
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    return (
        <section className="content">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Danh sách sử dụng mã giảm giá</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Trang chủ</Link>
                                </li>
                                <li className="breadcrumb-item active">Sử dụng mã giảm giá</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-tools">
                        <Button
                            type="primary"
                           
                            onClick={() => navigate('/CouponUsage/create')}
                            className="btn btn-success me-2 h-10"
                        >
                            + Thêm mới
                        </Button>
                    </div>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Đang tải...</div>
                    ) : (
                        <>
                            <table className="table table-hover text-nowrap">
                                <thead>
                                    <tr>
                                        <th>Mã giảm giá</th>
                                        <th>Mã code</th>
                                        <th>Người dùng</th>
                                        <th>Email</th>
                                        <th>Số lần sử dụng</th>
                                        <th>Ngày tạo</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {couponUsages.length > 0 ? (
                                        couponUsages.map((usage) => (
                                            <tr key={usage.id}>
                                                <td>{usage.coupon?.name}</td>
                                                <td>{usage.coupon?.code}</td>
                                                <td>{usage.user?.name}</td>
                                                <td>{usage.user?.email}</td>
                                                <td>{usage.amount}</td>
                                                <td>{new Date(usage.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <button
                                                            className="btn btn-sm btn-primary me-1"
                                                            onClick={() => handleEdit(usage)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(usage.id)}
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
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Modal chỉnh sửa amount */}
                            <Modal
                                title="Chỉnh sửa số lần sử dụng"
                                open={isEditModalVisible}
                                onOk={handleSaveEdit}
                                onCancel={() => {
                                    setIsEditModalVisible(false);
                                    setCoupon(null);
                                }}
                                okText="Lưu"
                                cancelText="Hủy"
                            >
                                {coupon && (
                                    <div className="mb-3">
                                        <h5>Thông tin mã giảm giá</h5>
                                        <p><strong>Tên mã:</strong> {coupon.name}</p>
                                        <p><strong>Mã code:</strong> {coupon.code}</p>
                                        <p><strong>Loại giảm giá:</strong> {coupon.discount_type === 0 ? 'Phần trăm' : 'Cố định'}</p>
                                        <p><strong>Số lượng còn lại: </strong>{coupon.max_uses}</p>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Số lần sử dụng:</label>
                                    <Input
                                        type="number"
                                        name='amount'
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                            </Modal>

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
                                        
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(currentPage + 1)} aria-label="Trang sau">
                                                <i className="fas fa-angle-right"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(totalPages)} aria-label="Trang cuối">
                                                <i className="fas fa-angle-double-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <button className="btn btn-outline-primary" onClick={() => fetchCouponUsage()}>
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

export default CouponUsageComponent;
