import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

import { getAttributes } from "@app/services/Attribute/ApiAttribute";


interface AttributeOption {
  value: number;
  label: string;
}


interface ValidationErrors {
  name?: string;
  price?: string;
  discount_percent?: string;
  category_id?: string;
  stock?: string;
  description?: string;
  image?: string;
}


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
  const { product, setProduct } = useOutletContext<{
    product: any;
    setProduct: React.Dispatch<React.SetStateAction<any>>;
    errors: ValidationErrors;
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  }>();

  
  const [allAttributes, setAllAttributes] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);


  const [tempAttributes, setTempAttributes] = useState<AttributeOption[]>([]);


  useEffect(() => {
    fetchAttributes()
      .then((data) => {
        setAllAttributes(data);
       
        setTempAttributes(
          data.filter((attr) => product.selected_attributes.includes(attr.value))
        );
      })
      .catch(() => toast.error("Không thể tải danh sách thuộc tính"))
      .finally(() => setLoading(false));
  }, [product.selected_attributes]);


  const handleChange = (selectedOptions: MultiValue<AttributeOption>) => {
    setTempAttributes(selectedOptions as AttributeOption[]);
  };

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
            options={allAttributes} 
            value={tempAttributes} 
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
