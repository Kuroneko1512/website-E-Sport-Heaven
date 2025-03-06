import React, { useState } from "react";
import Select, { MultiValue } from "react-select";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
// Định nghĩa kiểu dữ liệu cho thuộc tính
interface AttributeOption {
  value: number;
  label: string;
}

// Danh sách thuộc tính gốc
const allAttributes: AttributeOption[] = [
  { value: 1, label: "Màu sắc" },
  { value: 2, label: "Kích thước" },
  { value: 3, label: "Chất liệu" },
  { value: 4, label: "Kiểu dáng" },
];

const AttributeProduct = () => {
  const { product, setProduct } = useOutletContext<{
    product: any;
    setProduct: React.Dispatch<React.SetStateAction<any>>;
  }>();

  // State tạm để lưu giá trị chọn trước khi submit
  const [tempAttributes, setTempAttributes] = useState<AttributeOption[]>(
    allAttributes.filter((attr) =>
      product.selected_attributes.includes(attr.value)
    )
  );

  // Cập nhật state tạm khi thay đổi Select
  const handleChange = (selectedOptions: MultiValue<AttributeOption>) => {
    setTempAttributes(selectedOptions as AttributeOption[]);
  };

  // Khi nhấn Submit, lưu vào product
  const handleSubmitAttibute = () => {
    const selectedValues = tempAttributes.map((option) => option.value);
    setProduct((prev: any) => ({
      ...prev,
      selected_attributes: selectedValues, // ✅ Chỉ cập nhật khi nhấn Submit
    }));
    toast.success("Lưu thuộc tính thành công!");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Thêm thuộc tính</h3>
      </div>
      <div className="card-body">
        <Select
          isMulti
          options={allAttributes} // ✅ Hiển thị tất cả thuộc tính
          value={tempAttributes} // ✅ Dùng state tạm để lưu giá trị chọn
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value.toString()}
          onChange={handleChange}
        />
      
        <span className="btn btn-primary mt-3" onClick={handleSubmitAttibute}>
  Lưu thuộc tính
</span>

      </div>
    </div>
  );
};

export default AttributeProduct;
