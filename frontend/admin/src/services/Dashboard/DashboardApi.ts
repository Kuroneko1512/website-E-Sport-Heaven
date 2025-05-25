import { api } from "@app/api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

// Interface định nghĩa dữ liệu Dashboard
export interface DashboardData {
  today_summary: {
    total_revenue: number;
    total_orders: number;
    new_customers: number;
    avg_order_value: number;
  };
  revenue_chart: Array<{
    period: string;
    start_date: string;
    end_date: string;
    revenue: number;
    orders: number;
    avg_order_value: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    product_sku: string;
    category_name: string;
    total_sold: number;
    total_revenue: number;
    total_orders: number;
  }>;
  order_status: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready_to_ship: number;
    shipping: number;
    delivered: number;
    completed: number;
    cancelled: number;
    return_requested: number;
    return_processing: number;
    return_completed: number;
    return_rejected: number;
  };
  revenue_comparison: {
    current_period: {
      revenue: number;
      orders: number;
      avg_order_value: number;
    };
    previous_period: {
      revenue: number;
      orders: number;
      avg_order_value: number;
    };
    growth: {
      revenue_growth: number;
      orders_growth: number;
    };
  };
  customer_stats: {
    new_customers: number;
    returning_customers: number;
    total_customers_with_orders: number;
    customer_retention_rate: number;
  };
  recent_trends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  generated_at: string;
}

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  meta: {
    from_date: string;
    to_date: string;
    data_source: string;
    cache_duration: string;
    generated_at: string;
  };
}

// Hàm gọi API lấy dữ liệu dashboard analytics
export const getDashboardAnalytics = async (
  fromDate?: string,
  toDate?: string,
  topProductsLimit?: number
): Promise<DashboardApiResponse> => {
  try {
    let url = API_ENDPOINTS.DASHBOARD.ANALYTICS;
    // Thêm query parameters nếu có
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    if (topProductsLimit) params.append('top_products_limit', topProductsLimit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get<DashboardApiResponse>(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    throw error;
  }
};

// Interface định nghĩa dữ liệu của một Order (giữ lại từ code cũ)
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
  payment_method: string;
}

interface OrderResponse {
  message: string;
  data?: any;
}

// Interface định nghĩa dữ liệu trả về từ API, bao gồm thông tin phân trang
export interface Pagination {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  total: number;
  per_page: number;
  data: Order[];
}

export const getOrderById = async (id: string | number) => {
  return await api.get<OrderResponse>(`${API_ENDPOINTS.ORDER.BASE}/${id}`);
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

export const getOrders = async (page: number = 1, limit: number = 5, account_type: string = '', search: string = ''): Promise<Pagination> => {
  try {
    const response = await api.get<Pagination>(`${API_ENDPOINTS.ORDER.BASE}?page=${page}&limit=${limit}&account_type=${account_type}&search=${search}`);
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
