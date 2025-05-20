import { API_CONFIG } from "@app/api/config";
import axios from "axios";
import { PaginatedResponse } from "../BaseApi";
import { api } from "../../api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

export interface Review {
  id: number;
  product_id: number;
  product_variant_id: number;
  rating: number;
  title: string;
  comment: string;
  images: string;
  created_at: string;
  updated_at: string;
  publish_date: string;
}

const ReviewService = {
  getAll: async (params: any): Promise<PaginatedResponse<Review>> => {
    for (const key in params) {
      if (!params[key]) {
        delete params[key];
      }
    }
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`${API_ENDPOINTS.REVIEW.LIST}?${queryParams}`);
    return response.data?.data;
  },

  create: async (data: any): Promise<Review> => {
    const response = await api.post(API_ENDPOINTS.REVIEW.CREATE, data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<Review> => {
    const response = await api.put(`${API_ENDPOINTS.REVIEW.UPDATE(id)}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.REVIEW.DELETE(id)}`);
  },

  getById: async (id: number): Promise<Review> => {
    const response = await api.get(`${API_ENDPOINTS.REVIEW.DETAIL(id)}`);
    return response.data?.data;
  },

};

export default ReviewService;
