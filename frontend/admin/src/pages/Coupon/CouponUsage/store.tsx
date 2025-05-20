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
      const selectedCoupon = coupon.find(c => c.id === couponUsage.coupon_id);
      if (couponUsage.coupon_id === 0) {
        toast.error("Vui lòng chọn mã giảm giá");
        return;
      }
      if (couponUsage.user_id === 0) {
        toast.error("Vui lòng chọn người dùng");
        return;
      }
      
      if (couponUsage.amount > selectedCoupon!.max_uses) {
        toast.error(`Số lượng vượt quá số lần sử dụng còn lại (${selectedCoupon!.max_uses})`);
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
              <li className="breadcrumb-item"><Link to={"/"}>Trang chủ</Link></li>
              <li className="breadcrumb-item"><Link to={"/CouponUsage"}>Sử dụng mã giảm giá</Link></li>
              <li className="breadcrumb-item active">Thêm mới</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary">
              <h3 className="card-title text-white">
                <i className="fas fa-edit mr-2"></i>Thông tin mã giảm giá
              </h3>
              <div className="card-tools">
                <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
  
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="coupon" className="font-weight-bold">
                    Chọn mã giảm giá <span className="text-danger">*</span>
                  </label>
                  <select
                    id="coupon"
                    className="form-control"
                    value={couponUsage.coupon_id}
                    onChange={(e) => setCouponUsage({ ...couponUsage, coupon_id: parseInt(e.target.value) })}
                  >
                    <option value={0}>Chọn mã giảm giá</option>
                    {coupon.map((coupon) => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.name} - Số lần sử dụng còn lại: {coupon.max_uses}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="form-group">
                  <label htmlFor="user" className="font-weight-bold">Chọn người dùng 
                  <span className="text-danger"> *</span>
                  </label>
                  <select
                    id="user"
                    className="form-control"
                    value={couponUsage.user_id}
                    onChange={(e) => setCouponUsage({ ...couponUsage, user_id: parseInt(e.target.value) })}
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
                    onChange={(e) => setCouponUsage({ ...couponUsage, amount: parseInt(e.target.value) })}
                  />
                </div>
  
                <div className="form-group text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={() => navigate('/coupon')}>
                    <i className="fas fa-times mr-1"></i> Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save mr-1"></i> Cập nhật mã giảm giá
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default CouponUsageStore;
