// src/api/productApi.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1/product";

// Interface định nghĩa dữ liệu của một sản phẩm
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  discount_percent?: string;
  sku: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: string;
  stock: number;
  image?: File | null;
}

// Tạo sản phẩm mới
export const createProduct = async (product: FormData): Promise<Product> => {
  try {
    const response = await axios.post<Product>(API_URL, product, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};

// Lấy danh sách sản phẩm
export const getProducts = async () => {
  return await axios.get(API_URL);
};

// Cập nhật sản phẩm theo ID
export const updateProduct = async (
  id: number,
  product: FormData | Partial<Product>
): Promise<Product> => {
  try {
    const response = await axios.put<Product>(
      `${API_URL}/${id}`,
      product,
      {
        headers: {
          "Content-Type": product instanceof FormData ? "multipart/form-data" : "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};

// Xóa sản phẩm theo ID
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    console.log(`Đã xóa sản phẩm có ID: ${id}`);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};
