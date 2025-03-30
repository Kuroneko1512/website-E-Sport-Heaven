import { apiService } from "../BaseApi";

export type Category = {
  id: number;
  name: string;
  description: string;
  parent_id?:number;
  products_count: number;
  subcategories_count: number;
  created_at: string;
  updated_at: string;
};

export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: Category[]; // Mảng dữ liệu attributes
}


const Category_API = "/api/v1/category";

export const CategoryService = {
  getAll: (page = 1, perPage = 5) => apiService.get<Category>(`${Category_API}?page=${page}&per_page=${perPage}`),
  getAllNoPagination: () => apiService.get<Category>(`${Category_API}/indexNoPagination`),
  getById: (id: number) => apiService.get<Category>(`${Category_API}/${id}`),
  create: (product: Omit<Category, "id">) => apiService.post<Category>(Category_API, product),
  update: (id: number, product: Partial<Category>) => apiService.put<Category>(`${Category_API}/${id}`, product),
  delete: (id: number) => apiService.delete(`${Category_API}/${id}`),
};
