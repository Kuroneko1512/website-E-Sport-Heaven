import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const apiService = {
  get: async <T>(url: string): Promise<T> => {
    const response = await apiClient.get(url);
    return response.data;
  },
  post: async <T>(url: string, data: unknown): Promise<T> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  put: async <T>(url: string, data: unknown): Promise<T> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },
  delete: async (url: string): Promise<void> => {
    await apiClient.delete(url);
  },
};
