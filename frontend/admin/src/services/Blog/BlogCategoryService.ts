import { PaginatedResponse } from "../BaseApi";
import { api } from "../../api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

export interface BlogCategories {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
  description?: string;
}

const BlogCategoryService = {
  getAll: async (
    page: number = 1
  ): Promise<PaginatedResponse<BlogCategories>> => {
    const response = await api.get(
      `${API_ENDPOINTS.BLOG_CATEGORY.LIST}?page=${page}`
    );
    return response.data.data;
  },

  create: async (data: Omit<BlogCategories, "id">): Promise<BlogCategories> => {
    const response = await api.post(API_ENDPOINTS.BLOG_CATEGORY.CREATE, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<BlogCategories>
  ): Promise<BlogCategories> => {
    const response = await api.put(
      `${API_ENDPOINTS.BLOG_CATEGORY.UPDATE(id)}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BLOG_CATEGORY.DELETE(id)}`);
  },

  getById: async (id: number): Promise<BlogCategories> => {
    const response = await api.get(`${API_ENDPOINTS.BLOG_CATEGORY.DETAIL(id)}`);
    return response.data?.data;
  },
};

export default BlogCategoryService;