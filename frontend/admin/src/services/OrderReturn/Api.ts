
import { api } from "@app/api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

// Interface định nghĩa dữ liệu của một Order
export interface Order {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  order_code: string;
  total_amount: number;
  status: number;
  customer_id: number;
  created_at: string;
  payment_status: number;
}
interface OrderResponse {
    message: string;
    data?: any;
  }


export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: Order[]; // Mảng dữ liệu orders
}


export const getOrderReturnById = async (id: string | number) => {
  return await api.get<OrderResponse>(`${API_ENDPOINTS.ORDER.BASE}/${id}/order-user-return`);
};


export const updateOrderStatus = async (id: number, status: number): Promise<OrderResponse> => {
    try {
      const response = await api.put<OrderResponse>(`${API_ENDPOINTS.ORDER.BASE}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      throw error;
    }
  };

// Hàm gọi API lấy danh sách orders với phân trang
export const getOrders = async (page: number = 1, limit: number = 5): Promise<Pagination> => {
  try {
    const response = await api.get<Pagination>(`${API_ENDPOINTS.ORDER.BASE}/order-return?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const deleteOrder = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_ENDPOINTS.ORDER.BASE}/${id}`);
    console.log(`Deleted order with id: ${id}`);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};
