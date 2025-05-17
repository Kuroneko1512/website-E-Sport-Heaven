import { useState, useEffect } from "react";

import { createCouponUsage } from "@app/services/Coupon/CouponUsage/ApiCouponUsage";
import { User } from "@app/services/User/Type";
import { getUserList } from "@app/services/User/Type";
import { getCoupons } from "@app/services/Coupon/ApiCoupon";
import { toast } from "react-toastify";

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
  discount_type: string;
  max_uses: number;
}

const CouponUsageStore = () => {
  const [user, setUser] = useState<User[]>([]);
  const [coupon, setCoupon] = useState<Coupon[]>([]);
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
        toast.error("Vui lòng chọn coupon");
        return;
      }
      if (couponUsage.user_id === 0) {
        toast.error("Vui lòng chọn user");
        return;
      }
     
      
       await createCouponUsage(couponUsage);
      toast.success("Thêm coupon usage thành công!");
      setCouponUsage({ coupon_id: 0, user_id: 0, amount: 0 });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm coupon usage");
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thêm Coupon Usage</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Chọn Coupon
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300"
            value={couponUsage.coupon_id}
            onChange={(e) => setCouponUsage({...couponUsage, coupon_id: parseInt(e.target.value)})}
          >
            <option value={0}>Chọn coupon</option>
            {coupon.map((coupon) => (
              <option key={coupon.id} value={coupon.id}>
                {coupon.name} -  {`Số lần sử dụng còn lại: ${coupon.max_uses}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Chọn User
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300"
            value={couponUsage.user_id}
            onChange={(e) => setCouponUsage({...couponUsage, user_id: parseInt(e.target.value)})}
          >
            <option value={0}>Chọn user</option>
            {user.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Số lượng
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300"
            value={couponUsage.amount}
            onChange={(e) => setCouponUsage({...couponUsage, amount: parseInt(e.target.value)})}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Thêm
        </button>
      </form>
    </div>
  );
};

export default CouponUsageStore;
