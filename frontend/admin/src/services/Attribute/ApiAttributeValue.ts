import { apiService } from "../BaseApi";

export type AttributeValue = {
  id: number;
  attribute_id: number;
  value: string;
  description?: string;
  image?: string;
};


export interface Pagination {
  current_page: number; // Trang hiện tại
  last_page: number; // Tổng số trang
  prev_page_url: string | null; // Link trang trước (null nếu không có)
  next_page_url: string | null; // Link trang tiếp theo (null nếu không có)
  total: number; // Tổng số records
  per_page: number; // Số records trên mỗi trang
  data: AttributeValue[]; // Mảng dữ liệu attribute_values
}

export interface AttributeValueResponse {
  data: AttributeValue[];
  meta: Pagination;
}

const AttributeValue_API = "/api/v1/attributeValue";

export const AttributeValueService = {
  /** Lấy danh sách Attribute Value theo `attribute_id` */
  getAll: (attribute_id: number, page = 1, perPage = 5) =>
    apiService.get<Pagination>(`${AttributeValue_API}/index/${attribute_id}?page=${page}&per_page=${perPage}`),

  /** Lấy một Attribute Value theo ID */
  getById: (id: number) =>
    apiService.get<AttributeValueResponse>(`${AttributeValue_API}/${id}`),

  /** Tạo mới Attribute Value */
  create: (attributeValue: Omit<AttributeValue, "id">) =>
    apiService.post<AttributeValueResponse>(`${AttributeValue_API}`, attributeValue),

  /** Cập nhật Attribute Value */
  update: (id: number, attributeValue: Partial<AttributeValue>) =>
    apiService.put<AttributeValueResponse>(`${AttributeValue_API}/${id}`, attributeValue),

  /** Xóa Attribute Value */
  delete: (id: number) => apiService.delete(`${AttributeValue_API}/${id}`),
};
