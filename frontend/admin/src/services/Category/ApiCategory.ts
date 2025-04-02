// src/api/attributeApi.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/category';





// Interface định nghĩa dữ liệu của một attribute
export interface Category {
  id?: number;
  name: string;
  description?: string;
  parent_id?:number;
}

// Interface định nghĩa dữ liệu trả về từ API, bao gồm thông tin phân trang


export const createCategory = async (attribute: FormData): Promise<Category> => {
  try {
    const response = await axios.post<Category>(API_URL, attribute, {
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
export const getCategory = async () => {
  return await axios.get(`${API_URL}`);
};
// Hàm cập nhật một thuộc tính dựa vào ID
export const updateCategory = async (
  id: number, // ID của thuộc tính cần cập nhật
  attribute: FormData | { name: string; description: string } // Dữ liệu cần cập nhật, có thể là FormData hoặc Object JSON
): Promise<Category> => {
  try {
    // Gửi yêu cầu cập nhật dữ liệu lên API bằng phương thức PUT
    const response = await axios.put<Category>(
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


export const deleteCategory = async (id: number): Promise<void> => {
  try {
    // console.log(`Sending DELETE request to: ${API_URL}/attributes/${id}`);
    await axios.delete(`${API_URL}/${id}`);
    console.log(`Deleted attribute with id: ${id}`);
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
};
