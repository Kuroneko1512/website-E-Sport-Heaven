import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const apiService = {
  get: async <T>(url: string): Promise<T> => {
    // const response = await apiClient.get(url);
    return await apiClient.get(url);
  },
  post: async <T>(url: string, data: unknown): Promise<T> => {
  
    return await apiClient.post(url, data);
  },
  put: async <T>(url: string, data: unknown): Promise<T> => {
   
    return await apiClient.put(url, data);
  },
  delete: async (url: string): Promise<void> => {
    await apiClient.delete(url);
  },
};

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  total: number;
  per_page: number;
}
