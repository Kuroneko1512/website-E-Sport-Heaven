import { apiService } from "../BaseApi";

export type Category = {
  id: number;
  name: string;
  description: number;
};

const Category_API = "/api/v1/category";

export const productService = {
  getAll: () => apiService.get<Category[]>(Category_API),
  getById: (id: number) => apiService.get<Category>(`${Category_API}/${id}`),
  create: (product: Omit<Category, "id">) => apiService.post<Category>(Category_API, product),
  update: (id: number, product: Partial<Category>) => apiService.put<Category>(`${Category_API}/${id}`, product),
  delete: (id: number) => apiService.delete(`${Category_API}/${id}`),
};
