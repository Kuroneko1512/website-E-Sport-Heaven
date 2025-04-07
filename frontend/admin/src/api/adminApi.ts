import axios from "axios";
import { API_CONFIG } from "./config";

export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const access_token   = localStorage.getItem("access_token");
    const refresh_token  = localStorage.getItem("refresh_token");
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Không xóa token và chuyển hướng ở đây
            // Thay vào đó, dispatch một action để xử lý trong component
            console.error("Unauthorized access, please login again");
        }
        return Promise.reject(error);
    }
);
