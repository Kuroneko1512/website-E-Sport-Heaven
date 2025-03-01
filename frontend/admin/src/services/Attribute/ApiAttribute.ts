// src/api/attributeApi.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/attribute';





// Interface định nghĩa dữ liệu của một attribute
export interface Attribute {
  id?: number;
  name: string;
  description?: string;
}

// Interface định nghĩa dữ liệu trả về từ API, bao gồm thông tin phân trang
export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: Attribute[]; // Mảng dữ liệu attributes
}

export const createAttribute = async (attribute: FormData): Promise<Attribute> => {
  try {
    const response = await axios.post<Attribute>(API_URL, attribute, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating attribute:', error);
    throw error;
  }
};
export const getAttributeById = async (id: string | number) => {
  return await axios.get(`${API_URL}/${id}`);
};
// Hàm cập nhật một thuộc tính dựa vào ID
export const updateAttribute = async (
  id: number, // ID của thuộc tính cần cập nhật
  attribute: FormData | { name: string; description: string } // Dữ liệu cần cập nhật, có thể là FormData hoặc Object JSON
): Promise<Attribute> => {
  try {
    // Gửi yêu cầu cập nhật dữ liệu lên API bằng phương thức PUT
    const response = await axios.put<Attribute>(
      `${API_URL}/${id}`, // URL API endpoint có chứa ID của thuộc tính cần cập nhật
      attribute, // Dữ liệu thuộc tính cần gửi
      {
        headers: {
          // Kiểm tra nếu attribute là FormData thì dùng "multipart/form-data"
          // Ngược lại, nếu là object JSON thì dùng "application/json"
          "Content-Type": attribute instanceof FormData ? "multipart/form-data" : "application/json",
        },
      }
    );

    // Trả về dữ liệu phản hồi từ API sau khi cập nhật thành công
    return response.data;
  } catch (error) {
    // In lỗi ra console nếu có lỗi xảy ra trong quá trình gửi request
    console.error("Error updating attribute:", error);
    throw error; // Ném lỗi để có thể xử lý ở nơi gọi hàm này
  }
};

// Hàm gọi API lấy danh sách attributes với phân trang
export const getAttributes = async (page: number = 1, limit: number = 5): Promise<Pagination> => {
  try {
    // Gửi request đến API Laravel với tham số page và limit
    const response = await axios.get<Pagination>(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data; // Trả về dữ liệu nhận được
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }

  
};

export const deleteAttribute = async (id: number): Promise<void> => {
  try {
    // console.log(`Sending DELETE request to: ${API_URL}/attributes/${id}`);
    await axios.delete(`${API_URL}/${id}`);
    console.log(`Deleted attribute with id: ${id}`);
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
};
