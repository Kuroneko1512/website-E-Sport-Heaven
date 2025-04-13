import { apiService } from "../BaseApi";

export type Category = {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
  products_count?: number;
  subcategories_count?: number;
};

export interface Pagination {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  total: number;
  per_page: number;
  data: Category[];
}

// Thêm interface cho response API
export interface ApiResponse<T> {
  data: any;
  message?: string;
  status?: number;
}

const Category_API = "/api/v1/category";

export const CategoryService = {
  getAll: (page = 1, perPage = 5) =>
    apiService.get<ApiResponse<Pagination>>(
      `${Category_API}?page=${page}&per_page=${perPage}`
    ),

  getAllNoPagination: () =>
    apiService.get<ApiResponse<Category[]>>(
      `${Category_API}/indexNoPagination`
    ),

  getById: (id: number) =>
    apiService.get<ApiResponse<Category>>(`${Category_API}/${id}`),

  create: (category: any) =>
    apiService.post<ApiResponse<Category>>(Category_API, category),

  update: (id: number, category: Partial<Category>) =>
    apiService.put<ApiResponse<Category>>(`${Category_API}/${id}`, category),

  delete: (id: number) => apiService.delete(`${Category_API}/${id}`), // Bỏ type parameter
};
