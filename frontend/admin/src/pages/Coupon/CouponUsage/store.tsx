import { useState, useEffect } from "react";
import { createCouponUsage } from "@app/services/Coupon/CouponUsage/ApiCouponUsage";
import { User } from "@app/services/User/Type";
import { getUserList } from "@app/services/User/Type";
import { getCoupons } from "@app/services/Coupon/ApiCoupon";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

interface CouponUsage {
  coupon_id: number;
  user_id: number;
  amount: number;
}

interface Coupon {
  id: number;
  name: string;
  description: string;
  discount_value: number;
  discount_type: number;
  max_uses: number;
}

const CouponUsageStore = () => {
  const [user, setUser] = useState<User[]>([]);
  const [coupon, setCoupon] = useState<Coupon[]>([]);
  const navigate = useNavigate();
  const [couponUsage, setCouponUsage] = useState<CouponUsage>({
    coupon_id: 0,
    user_id: 0,
    amount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, couponResponse] = await Promise.all([
          getUserList(),
          getCoupons()
        ]);
        setUser(userResponse);
        setCoupon(couponResponse.data);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (couponUsage.coupon_id === 0) {
        toast.error("Vui lòng chọn mã giảm giá");
        return;
      }
      if (couponUsage.user_id === 0) {
        toast.error("Vui lòng chọn user");
        return;
      }
      await createCouponUsage(couponUsage);
      toast.success("Thêm coupon usage thành công!");
      setCouponUsage({ coupon_id: 0, user_id: 0, amount: 0 });
      navigate("/CouponUsage");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm coupon usage");
    }
  };

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thêm sử dụng mã giảm giá</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to={"/"}>Trang chủ</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={"/CouponUsage"}>Sử dụng mã giảm giá</Link>
                </li>
                <li className="breadcrumb-item active">Thêm mới</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Thông tin sử dụng mã giảm giá</h3>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="coupon">Chọn mã giảm giá</label>
              <select
                id="coupon"
                className="form-control"
                value={couponUsage.coupon_id}
                onChange={(e) => setCouponUsage({...couponUsage, coupon_id: parseInt(e.target.value)})}
              >
                <option value={0}>Chọn mã giảm giá</option>
                {coupon.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.name} - {`Số lần sử dụng còn lại: ${coupon.max_uses}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="user">Chọn người dùng</label>
              <select
                id="user"
                className="form-control"
                value={couponUsage.user_id}
                onChange={(e) => setCouponUsage({...couponUsage, user_id: parseInt(e.target.value)})}
              >
                <option value={0}>Chọn người dùng</option>
                {user.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Số lượng</label>
              <input
                type="number"
                id="amount"
                className="form-control"
                value={couponUsage.amount}
                onChange={(e) => setCouponUsage({...couponUsage, amount: parseInt(e.target.value)})}
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                Thêm mới
              </button>
              <Link to="/CouponUsage" className="btn btn-default ml-2">
                Quay lại
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CouponUsageStore;
