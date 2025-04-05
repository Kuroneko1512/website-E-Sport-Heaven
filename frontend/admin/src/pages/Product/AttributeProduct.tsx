import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

import { getAttributes } from "@app/services/Attribute/ApiAttribute";

// API URL (thay thế bằng API thực tế của bạn)
// const API_URL = "https://your-api.com/api/attributes";

// Định nghĩa kiểu dữ liệu cho thuộc tính
interface AttributeOption {
  value: number;
  label: string;
}

// Định nghĩa kiểu dữ liệu cho errors
interface ValidationErrors {
  name?: string;
  price?: string;
  discount_percent?: string;
  category_id?: string;
  stock?: string;
  description?: string;
  image?: string;
}

// Hàm lấy thuộc tính từ API
const fetchAttributes = async (): Promise<AttributeOption[]> => {

  try {
    const response = await getAttributes();
    return response.data.data.map((attr: any) => ({
      value: attr.id,
      label: attr.name,
    }));
  } catch (error) {
    console.error("Lỗi khi tải thuộc tính:", error);
    throw error;
  }
};

const AttributeProduct = () => {
  const { product, setProduct, errors, setErrors } = useOutletContext<{
    product: any;
    setProduct: React.Dispatch<React.SetStateAction<any>>;
    errors: ValidationErrors;
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  }>();

  // State để lưu danh sách thuộc tính từ API
  const [allAttributes, setAllAttributes] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // State tạm lưu giá trị thuộc tính đã chọn
  const [tempAttributes, setTempAttributes] = useState<AttributeOption[]>([]);

  // Gọi API khi component mount
  useEffect(() => {
    fetchAttributes()
      .then((data) => {
        setAllAttributes(data);
        // Nếu product đã có thuộc tính, cập nhật vào state tạm
        setTempAttributes(
          data.filter((attr) => product.selected_attributes.includes(attr.value))
        );
      })
      .catch(() => toast.error("Không thể tải danh sách thuộc tính"))
      .finally(() => setLoading(false));
  }, [product.selected_attributes]);

  // Cập nhật state tạm khi thay đổi Select
  const handleChange = (selectedOptions: MultiValue<AttributeOption>) => {
    setTempAttributes(selectedOptions as AttributeOption[]);
  };

  // Khi nhấn Submit, lưu vào product
  const handleSubmitAttribute = () => {
    const selectedValues = tempAttributes.map((option) => option.value);
    setProduct((prev: any) => ({
      ...prev,
      selected_attributes: selectedValues,
    }));
    toast.success("Lưu thuộc tính thành công!");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Thêm thuộc tính</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <p>Đang tải thuộc tính...</p>
        ) : (
          <Select
            isMulti
            options={allAttributes} // ✅ Hiển thị tất cả thuộc tính từ API
            value={tempAttributes} // ✅ Dùng state tạm để lưu giá trị chọn
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value.toString()}
            onChange={handleChange}
          />
        )}

        <span className="btn btn-primary mt-3" onClick={handleSubmitAttribute}>
          Lưu thuộc tính
        </span>
      </div>
    </div>
  );
};

export default AttributeProduct;
