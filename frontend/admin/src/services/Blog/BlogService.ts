import { API_CONFIG } from "@app/api/config";
import axios from "axios";
import { PaginatedResponse } from "../BaseApi";
import { BlogCategories } from "./BlogCategoryService";
import { api } from "../../api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category_id: number;
  category: BlogCategories;
  status: "published" | "draft";
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
    const response = await api.get(`${API_ENDPOINTS.BLOG.LIST}?${queryParams}`);
    return response.data?.data;
  },

  create: async (data: any): Promise<BlogPost> => {
    const response = await api.post(API_ENDPOINTS.BLOG.CREATE, data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<BlogPost> => {
    const response = await api.put(`${API_ENDPOINTS.BLOG.UPDATE(id)}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BLOG.DELETE(id)}`);
  },

  getById: async (id: number): Promise<BlogPost> => {
    const response = await api.get(`${API_ENDPOINTS.BLOG.DETAIL(id)}`);
    return response.data?.data;
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`${API_ENDPOINTS.BLOG.SLUG(slug)}`);
    return response.data?.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const body = new FormData();
    body.append("image", file);
    const response = await api.post(API_ENDPOINTS.BLOG.UPLOAD_IMAGE, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.url;
  },
};

export default BlogService;
