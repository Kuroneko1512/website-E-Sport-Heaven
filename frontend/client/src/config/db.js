import axios from "axios";
import Cookies from 'js-cookie';

const instanceAxios = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Sử dụng interceptor để thêm Authorization header với Bearer token
instanceAxios.interceptors.request.use(
  (config) => {
    // Lấy access token từ Redux hoặc localStorage
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instanceAxios;