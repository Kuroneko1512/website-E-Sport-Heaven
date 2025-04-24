import axios from 'axios';
import { API_CONFIG } from '@app/api/config';
import { PaginatedResponse } from '../BaseApi';

export interface BlogCategories {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
  description?: string;
}

const BlogCategoryService = {
  getAll: async (page: number = 1): Promise<PaginatedResponse<BlogCategories>> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/blog-categories?page=${page}`);    
    return response.data.data;
  },

  create: async (data: Omit<BlogCategories, 'id'>): Promise<BlogCategories> => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/blog-categories`, data);
    return response.data;
  },

  update: async (id: number, data: Partial<BlogCategories>): Promise<BlogCategories> => {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/v1/blog-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_CONFIG.BASE_URL}/v1/blog-categories/${id}`);
  },

  getById: async (id: number): Promise<BlogCategories> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/blog-categories/${id}`);
    return response.data?.data;
  }
};

export default BlogCategoryService;