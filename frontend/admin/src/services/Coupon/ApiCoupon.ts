import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/coupon';

// Interface định nghĩa dữ liệu của một coupon
export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_value: number;
  discount_type: number;
  is_active: number;
  start_date: string;
  end_date: string;
  max_uses: number;
  max_purchase: number;

}

// Interface định nghĩa dữ liệu trả về từ API, bao gồm thông tin phân trang
export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: Coupon[]; // Mảng dữ liệu coupons
}

// Hàm gọi API lấy danh sách coupons với phân trang
export const getCoupons = async (page: number = 1, limit: number = 10, search: string = ''): Promise<Pagination> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const response = await axios.get<Pagination>(`${API_URL}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};

// Tạo mới coupon
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>) => {    
  try {
    const response = await axios.post(API_URL, couponData);
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};


export const updateCoupon = async (couponId: number, couponData: Partial<Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>>) => {  
  try {
    const response = await axios.put(`${API_URL}/${couponId}`, couponData);
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
};

// Xóa coupon
export const deleteCoupon = async (couponId: number) => {   
  try {
    const response = await axios.delete(`${API_URL}/${couponId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết một coupon
export const getCouponById = async (couponId: number): Promise<Coupon> => {
  try {
    const response = await axios.get(`${API_URL}/${couponId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    throw error;
  }
};

export const checkCouponCodeExists = async (code: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/check-code/${code}`);
    return response.data.exists;
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã:", error);
    return false;
  }
};


 




