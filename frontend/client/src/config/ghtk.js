import axios from 'axios';


const apiGhtk = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// Hàm gọi API tính phí vận chuyển
export const getShippingFee = async (params) => {
  try {
    const response = await apiGhtk.get('/shipping/fee', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API GHTK:', error);
    throw error;
  }
};

export default apiGhtk;