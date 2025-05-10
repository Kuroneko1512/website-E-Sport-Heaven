// src/api/productApi.ts
import Product from "@app/pages/Product/Product";
// import axios from "axios";
import { api } from "@app/api/adminApi";
import { API_ENDPOINTS } from "@app/api/endpoints";

// const API_URL = "http://127.0.0.1:8000/api/v1/product";

// Interface định nghĩa dữ liệu của một sản phẩm
export interface AttributeSelection {
  attribute_id: number;
  attribute_value_id: number;
}

export interface Variant {
  id?: number;
  price: number;
  stock: number;
  image?: File | string | null;
  product_attributes: AttributeSelection[];
}

export interface Pagination {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  total: number;
  per_page: number;
  data: api4[];
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
export const createProduct = async (product: api4): Promise<api4> => {
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
        formData.append("selected_attributes[]", String(attr));
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
        variant.product_attributes.forEach((attribute, attrIndex) => {
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
    // const response = await axios.post<api4>(API_URL, formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    const response = await api.post<api4>(API_ENDPOINTS.PRODUCT.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};
export const updateProduct = async (id: number, product: api4): Promise<api4> => {
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
        formData.append("selected_attributes[]", String(attr));
      });
    }
    if (product.description) {
      formData.append("description", product.description);
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant, index) => {
        if(variant.id){
          formData.append(`variants[${index}][id]`, String(variant.id));
        }
        formData.append(`variants[${index}][price]`, String(variant.price));
        formData.append(`variants[${index}][stock]`, String(variant.stock));
        if (variant.image) {
          formData.append(`variants[${index}][image]`, variant.image);
        }
        variant.product_attributes.forEach((attribute, attrIndex) => {
          formData.append(`variants[${index}][attributes][${attrIndex}][attribute_id]`, String(attribute.attribute_id));
          formData.append(`variants[${index}][attributes][${attrIndex}][attribute_value_id]`, String(attribute.attribute_value_id));
        });
      });
    }

    // 🟢 Kiểm tra hình ảnh
    if (product.image) {
      formData.append("image", product.image);
    }
    formData.append("_method", "PUT");
    // Log dữ liệu trước khi gửi lên API
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // 🟢 Gửi API
    // const response = await axios.post<api4>(`${API_URL}/${id}`, formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    const response = await api.post<api4>(`${API_ENDPOINTS.PRODUCT.UPDATE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;

 
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};


// Lấy danh sách sản phẩm
export const getProducts = async (page: number = 1, limit: number = 5): Promise<Pagination> => {
  try {
    // const response = await axios.get<Pagination>(`${API_URL}?page=${page}&limit=${limit}`);
    const response = await api.get<Pagination>(`${API_ENDPOINTS.PRODUCT.GET_ALL}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id: number): Promise<api4> => {
  try {
    // const response = await axios.get<api4>(`${API_URL}/${id}`);
    const response = await api.get<api4>(`${API_ENDPOINTS.PRODUCT.GET_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};


// Xóa sản phẩm theo ID
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    // await axios.delete(`${API_URL}/${id}`);
    await api.delete(`${API_ENDPOINTS.PRODUCT.DELETE}/${id}`);
    console.log(`Đã xóa sản phẩm có ID: ${id}`);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};
