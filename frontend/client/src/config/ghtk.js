import axios from 'axios';

const apiGhtk = axios.create({
  baseURL: 'https://services.giaohangtietkiem.vn',
  headers: {
    "Content-Type": "application/json",
    'Token': "1EJMnuJmnfE2MQnknmYLaArcYb95ve1ISUEiwA3",
    "X-Client-Source": "S22882891",
  },
});

// Hàm gọi API tính phí vận chuyển
export const getShippingFee = async (params) => {
  try {
    const response = await apiGhtk.get('/services/shipment/fee', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API GHTK:', error);
    throw error;
  }
};

export default apiGhtk;