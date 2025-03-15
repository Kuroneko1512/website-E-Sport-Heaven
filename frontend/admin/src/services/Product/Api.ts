// src/api/productApi.ts
import Product from "@app/pages/Product/Product";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1/product";

// Interface định nghĩa dữ liệu của một sản phẩm
export interface AttributeSelection {
  attribute_id: number;
  attribute_value_id: number;
}

export interface Variant {
  price: number;
  stock: number;
  image?: File | string | null;
  attributes: AttributeSelection[];
}
export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: api4 []; // Mảng dữ liệu attributes
}

export interface api4 {
  id?: number;
  name: string;
  description?: string;
  price: number;
  discount_percent?: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: string;
  stock: number;
  image?: File | null;
  selected_attributes: AttributeSelection[];  
  variants: Variant[];  
}

// Tạo sản phẩm mới
export const createProduct = async (product: Product): Promise<Product> => {
  try {
    const formData = new FormData();
    console.log(product);

    // 🟢 Kiểm tra và thêm các trường bắt buộc
    formData.append("name", product.name);
    formData.append("price", String(product.price));
    if (product.discount_percent) formData.append("discount_percent", String(product.discount_percent));
    formData.append("product_type", product.product_type);
    formData.append("status", product.status);
    formData.append("category_id", String(product.category_id));
    formData.append("stock", String(product.stock));

    // 🟢 Truyền mảng trực tiếp thay vì JSON chuỗi
    if (Array.isArray(product.selected_attributes)) {
      product.selected_attributes.forEach((attr) => {
        formData.append("selected_attributes[]", String(attr)); // Gửi từng phần tử trong mảng
      });
    }
    if (product.description) {
      formData.append("description", product.description);
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant, index) => {
        formData.append(`variants[${index}][price]`, String(variant.price));
        formData.append(`variants[${index}][stock]`, String(variant.stock));
        if (variant.image) {
          formData.append(`variants[${index}][image]`, variant.image);
        }
        variant.attributes.forEach((attribute, attrIndex) => {
          formData.append(`variants[${index}][attributes][${attrIndex}][attribute_id]`, String(attribute.attribute_id));
          formData.append(`variants[${index}][attributes][${attrIndex}][attribute_value_id]`, String(attribute.attribute_value_id));
        });
      });
    }

    // 🟢 Kiểm tra hình ảnh
    if (product.image) {
      formData.append("image", product.image);
    }

    // Log dữ liệu trước khi gửi lên API
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // 🟢 Gửi API
    const response = await axios.post<Product>(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};





// Lấy danh sách sản phẩm
export const getProducts = async (page : 1 , limit : 5): Promise<Pagination> => {
  try{
  
    const response = await axios.get<Pagination>(`${API_URL}?page=${page}&limit=${limit}`);
  
    return response.data;
  }
catch(error) {
  console.error("Error fetching products:",error);
  throw error;
}

};
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await axios.get<Product>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
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
