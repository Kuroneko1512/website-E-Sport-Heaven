import { API_CONFIG } from '@app/api/config';
import axios from 'axios';
import { PaginatedResponse } from '../BaseApi';
import { get } from 'http';
import { BlogCategories } from './BlogCategoryService';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category_id: number;
  category: BlogCategories;
  status: 'published' | 'draft';
  is_featured: boolean;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  publish_date: string;
}

const BlogService = {
  getAll: async (params: any): Promise<PaginatedResponse<BlogPost>> => {
    for (const key in params) {
      if (!params[key]) {
        delete params[key];
      }
    }
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/blogs?${queryParams}`);
    return response.data?.data;
  },

  create: async (data: any): Promise<BlogPost> => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/blogs`, data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<BlogPost> => {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/v1/blogs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_CONFIG.BASE_URL}/v1/blogs/${id}`);
  },

  getById: async (id: number): Promise<BlogPost> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/blogs/${id}`);
    return response.data?.data;
  },
  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/blogs/slug/${slug}`);
    return response.data?.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('image', file);
    return (await axios.post(`${API_CONFIG.BASE_URL}/v1/blogs/upload-image`, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data?.url;
  }
};

export default BlogService;