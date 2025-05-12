import { useParams } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { CouponForm } from "./type";
import { getCouponById } from "@app/services/Coupon/ApiCoupon";
import { Link } from "react-router-dom";

const DetailCoupon: FC = () => {
    const { id } = useParams();
    const [coupon, setCoupon] = useState<CouponForm>({
        code: "",
        name: "",
        description: "",
        discount_value: 0,
        discount_type: "percentage",
        start_date: "",
        end_date: "",
        min_purchase: 0,
        max_uses: 0,
        used_count: 0,
        is_active: 1,
        user_usage: []
    });

    useEffect(() => {
        const fetchCoupon = async () => {
            const response = await getCouponById(Number(id));
            setCoupon(response);
           
        }
        fetchCoupon();
    }, [id]);

    return (
        <div className="content">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Chi tiết mã giảm giá</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Trang chủ</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={"/coupon"}>Mã giảm giá</Link>
                                </li>
                                <li className="breadcrumb-item active">Chi tiết</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Thông tin mã giảm giá</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Mã giảm giá</label>
                                <p className="form-control-static">{coupon.code}</p>
                            </div>
                            <div className="form-group">
                                <label>Tên</label>
                                <p className="form-control-static">{coupon.name}</p>
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <p className="form-control-static">{coupon.description || 'Không có mô tả'}</p>
                            </div>
                            <div className="form-group">
                                <label>Loại giảm giá</label>
                                <p className="form-control-static">
                                    {coupon.discount_type === "percentage" ? 'Phần trăm' : 'Giá tiền'}
                                </p>
                            </div>
                            <div className="form-group">
                                <label>Giá trị giảm</label>
                                <p className="form-control-static">
                                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `${coupon.discount_value.toLocaleString()}đ`}
                                </p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Ngày bắt đầu</label>
                                <p className="form-control-static">{new Date(coupon.start_date).toLocaleDateString()}</p>
                            </div>
                            <div className="form-group">
                                <label>Ngày kết thúc</label>
                                <p className="form-control-static">{new Date(coupon.end_date).toLocaleDateString()}</p>
                            </div>
                            <div className="form-group">
                                <label>Số lượt sử dụng</label>
                                <p className="form-control-static">{coupon.used_count}/{coupon.max_uses}</p>
                            </div>
                            <div className="form-group">
                                <label>Số tiền tối thiểu</label>
                                <p className="form-control-static">{coupon.min_purchase.toLocaleString()}đ</p>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <p className="form-control-static">
                                    <span className={`badge ${coupon.is_active === 1 ? 'badge-success' : 'badge-danger'}`}>
                                        {coupon.is_active === 1 ? 'Hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                </p>
                            </div>
                            <div className="form-group">
                                <label>Đối tượng sử dụng</label>
                                <p className="form-control-static">
                                    {coupon.user_usage === null ? 'Tất cả người dùng' : 'Người dùng được chọn'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <Link to="/coupon" className="btn btn-secondary">Quay lại</Link>
                    <Link to={`/edit-coupon/${id}`} className="btn btn-primary ml-2">Chỉnh sửa</Link>
                </div>
            </div>
        </div>
    );
};  
export default DetailCoupon;
