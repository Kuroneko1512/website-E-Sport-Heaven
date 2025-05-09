import React, { useState, useEffect, ChangeEvent } from "react";
import { useOutletContext } from "react-router-dom";

import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
import { getAttributesByIds } from "@app/services/Attribute/ApiAttribute";

// API để lấy danh sách thuộc tính


const VariantProduct = () => {

  const { product, setProduct } = useOutletContext<{
    product: any;
    setProduct: React.Dispatch<React.SetStateAction<any>>;
  }>();

  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 🌟 Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        if (!product.selected_attributes || product.selected_attributes.length === 0) return;
        console.log("Gọi API với selected_attributes:", product.selected_attributes);
  
        const response = await getAttributesByIds(product.selected_attributes);
      
        console.log(response);

          setAttributes(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thuộc tính:", error);
      }
    };
  
    fetchAttributes();
  }, [product.selected_attributes]); 

  useEffect(() => {
    if (product.variants) {
      setVariants(product.variants);
      setAllVariants(product.variants);
    }
  }, [product]);

  const handleAttributeChange = (attrId: number, valueId: number) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrId]: valueId }));
  };

  const generateVariants = () => {
    const selectedAttrArray = Object.entries(selectedAttributes);
    if (selectedAttrArray.length < 2) {
      alert("Hãy chọn ít nhất 2 thuộc tính!");
      return;
    }

    const newAttributesString = JSON.stringify(
      selectedAttrArray.map(([attrId, valueId]) => ({
        attribute_id: Number(attrId),
        attribute_value_id: Number(valueId),
      })).sort((a, b) => a.attribute_id - b.attribute_id)
    );

    const isDuplicate = variants.some(variant =>
      JSON.stringify(variant.product_attributes) === newAttributesString
    );

    if (isDuplicate) {
      alert("Biến thể này đã tồn tại!");
      return;
    }

    const newVariant = {
      price: 0,
      stock: 0,
      image: null as string | File | null,
      product_attributes: JSON.parse(newAttributesString),
    };

    setVariants((prev) => [...prev, newVariant]);
    setAllVariants((prev) => [...prev, newVariant]);
  };

  const handleChange = (index: number, field: "price" | "stock", value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: Number(value) } : v))
    );
    setAllVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: Number(value) } : v))
    );
  };

  const handleImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, image: file } : v))
      );
      setAllVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, image: file } : v))
      );
    }
  };

  // 🌟 Lưu tất cả biến thể vào product
  const handleSaveAll = () => {
    setProduct((prev: any) => ({
      ...prev,
      variants: allVariants,
    }));
    console.log("Đã lưu vào product:", product);
    alert("Lưu biến thể thành công!");
  };
const handleDeleteVariant = (id: number) => {
  const id_variant = variants[id];
  console.log(id_variant);
  
  setProduct((prev: any) => ({
    ...prev,
    variants: prev.variants.filter((_ : any, i: number) => i !== id)
  }));
}
  return (
    <div>
      <div className="p-3 border rounded shadow-sm bg-white">
        <h4 className="mb-3">Chọn thuộc tính</h4>
        <div className="row g-2 align-items-end">
          {attributes.map((attribute) => (
            <div key={attribute.id} className="col-md-auto">
              <label className="form-label">{attribute.name}:</label>
              <select
                className="form-select form-select-sm"
                onChange={(e) => handleAttributeChange(attribute.id, Number(e.target.value))}
              >
                <option value="">Chọn {attribute.name}</option>
                {attribute.values.map((value: any) => (
                  <option key={value.id} value={value.id}>
                    {value.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="col-md-auto">
            <span className="btn btn-primary btn-sm px-3" onClick={generateVariants}>
              Tạo
            </span>
          </div>
        </div>
      </div>

      {/* Bảng biến thể */}
      <div className="table-responsive mt-3">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thuộc tính</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <React.Fragment key={index}>
                <tr
                  className="variant-row"
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  <td>{variant.price.toLocaleString()}₫</td>
                  <td>{variant.stock}</td>
                  <td>
                    {variant.product_attributes
                      .map((attr: any) => {
                        const attrData = attributes.find((a) => a.id === attr.attribute_id);
                        const attrValue = attrData?.values.find((v: any) => v.id === attr.attribute_value_id);
                        return `${attrData?.name}: ${attrValue?.value}`;
                      })
                      .join(", ")} 
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteVariant(index)}>Xóa</button>
                  </td>
                </tr>

                {activeIndex === index && (
                  <tr className="detail-row">
                    <td colSpan={4} className="bg-light">
                      <strong>📌 Chi tiết biến thể:</strong>

                      <div className="d-flex justify-content-end my-2 ms-4">
                        <img
                          src={`http://127.0.0.1:8000/storage/${variant.image ? (typeof variant.image === "string" ? variant.image : URL.createObjectURL(variant.image)) : NoImage}`}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ height: "129px", marginRight: "48px", objectFit: "cover" }}
                        />
                      </div>

                      <form>
                        <div className="row my-2">
                          <div className="col">
                            <label>Giá</label>
                            <input
                              type="number"
                              className="form-control"
                              value={variant.price}
                              onChange={(e) => handleChange(index, "price", e.target.value)}
                            />
                          </div>

                          <div className="col">
                            <label>Chọn ảnh</label>
                            <input type="file" className="form-control" onChange={(e) => handleImageChange(index, e)} />
                          </div>
                        </div>

                        <div className="my-2">
                          <label>Kho</label>
                          <input
                            type="number"
                            className="form-control"
                            value={variant.stock}
                            onChange={(e) => handleChange(index, "stock", e.target.value)}
                          />
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

   
      <span className="btn btn-success mt-3" onClick={handleSaveAll}>
        Lưu tất cả biến thể
      </span>
    </div>
  );
};

export default VariantProduct;
