// src/api/orderApi.ts
// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api/v1/order";
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

// Interface định nghĩa dữ liệu trả về từ API, bao gồm thông tin phân trang
export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: Order[]; // Mảng dữ liệu orders
}

// export const createOrder = async (order: FormData): Promise<Order> => {
//   try {
//     const response = await axios.post<Order>(API_URL, order, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error creating order:", error);
//     throw error;
//   }
// };

export const getOrderById = async (id: string | number) => {
  return await api.get<OrderResponse>(`${API_ENDPOINTS.ORDER.BASE}/${id}`);
};

// Hàm cập nhật một đơn hàng dựa vào ID
// export const updateOrder = async (
//   id: number, // ID của đơn hàng cần cập nhật
//   order: FormData | Partial<Order> // Dữ liệu cần cập nhật, có thể là FormData hoặc object JSON chứa các trường cập nhật
// ): Promise<Order> => {
//   try {
//     // Gửi yêu cầu cập nhật dữ liệu lên API bằng phương thức PUT
//     const response = await axios.put<Order>(
//       `${API_URL}/${id}`, // URL API endpoint có chứa ID của đơn hàng cần cập nhật
//       order, // Dữ liệu đơn hàng cần gửi
//       {
//         headers: {
//           "Content-Type": order instanceof FormData ? "multipart/form-data" : "application/json",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Error updating order:", error);
//     throw error;
//   }
// };

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
export const getOrders = async (page: number = 1, limit: number = 5, account_type: string = ''): Promise<Pagination> => {
  try {
    const response = await api.get<Pagination>(`${API_ENDPOINTS.ORDER.BASE}?page=${page}&limit=${limit}&account_type=${account_type}`);
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
