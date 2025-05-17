import { useEffect, useState, FC } from 'react';
import { getCouponUsage, CouponUsage, deleteCouponUsage } from '@app/services/Coupon/CouponUsage/ApiCouponUsage';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const CouponUsageComponent: FC = () => {
    const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCouponUsage();
    }, [currentPage]);

    const fetchCouponUsage = async () => {
        try {
            setLoading(true);
            const response = await getCouponUsage();
            setCouponUsages(response.data.data.data);
            setTotalPages(response.data.data.last_page);
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Danh sách sử dụng mã giảm giá</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/CouponUsage/create')}
                >
                    Thêm mới
                </Button>
            </div>

            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-3 border-b text-left">Mã giảm giá</th>
                                <th className="px-6 py-3 border-b text-left">Mã code</th>
                                <th className="px-6 py-3 border-b text-left">Người dùng</th>
                                <th className="px-6 py-3 border-b text-left">Email</th>
                                <th className="px-6 py-3 border-b text-left">Số lần sử dụng</th>
                                <th className="px-6 py-3 border-b text-left">Ngày tạo</th>
                                <th className="px-6 py-3 border-b text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {couponUsages.map((usage) => (
                                <tr key={usage.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b">{usage.coupon?.name}</td>
                                    <td className="px-6 py-4 border-b">{usage.coupon?.code}</td>
                                    <td className="px-6 py-4 border-b">{usage.user?.name}</td>
                                    <td className="px-6 py-4 border-b">{usage.user?.email}</td>
                                    <td className="px-6 py-4 border-b">{usage.amount}</td>
                                    <td className="px-6 py-4 border-b">{new Date(usage.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 border-b">
                                        <button className="btn  btn-danger" onClick={() => handleDelete(usage.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2">Trang {currentPage}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponUsageComponent;
