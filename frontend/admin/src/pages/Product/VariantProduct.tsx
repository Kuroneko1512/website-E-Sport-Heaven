import React, { useState, useEffect, ChangeEvent } from "react";
import { useOutletContext } from "react-router-dom";
import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";

// Dữ liệu demo thuộc tính từ API
const demoAttributes = [
  { id: 1, name: "Màu sắc", values: [{ id: 1, value: "Đỏ" }, { id: 2, value: "Xanh" }] },
  { id: 2, name: "Kích thước", values: [{ id: 6, value: "M" }, { id: 7, value: "L" }] },
];

const VariantProduct = () => {
  const { product, setProduct } = useOutletContext<{
    product: any;
    setProduct: React.Dispatch<React.SetStateAction<any>>;
  }>();

  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 🌟 Khi vào form, lấy variants từ product nếu có
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
      JSON.stringify(variant.attributes) === newAttributesString
    );

    if (isDuplicate) {
      alert("Biến thể này đã tồn tại!");
      return;
    }

    const newVariant = {
      price: 0,
      stock: 0,
      image: null as string | File | null,
      attributes: JSON.parse(newAttributesString),
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
  };

  return (
    <div>
      <div className="p-3 border rounded shadow-sm bg-white">
        <h4 className="mb-3">Chọn thuộc tính</h4>
        <div className="row g-2 align-items-end">
          {demoAttributes.map((attribute) => (
            <div key={attribute.id} className="col-md-auto">
              <label className="form-label">{attribute.name}:</label>
              <select
                className="form-select form-select-sm"
                onChange={(e) => handleAttributeChange(attribute.id, Number(e.target.value))}
              >
                <option value="">Chọn {attribute.name}</option>
                {attribute.values.map((value) => (
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
                    {variant.attributes
                      .map((attr:any) => {
                        const attrData = demoAttributes.find((a) => a.id === attr.attribute_id);
                        const attrValue = attrData?.values.find((v) => v.id === attr.attribute_value_id);
                        return `${attrData?.name}: ${attrValue?.value}`;
                      })
                      .join(", ")} 
                  </td>
                </tr>

                {activeIndex === index && (
                  <tr className="detail-row">
                    <td colSpan={4} className="bg-light">
                      <strong>📌 Chi tiết biến thể:</strong>

                      <div className="d-flex justify-content-end my-2 ms-4">
                        <img
                          src={variant.image ? (typeof variant.image === "string" ? variant.image : URL.createObjectURL(variant.image)) : NoImage}
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

      {/* 🌟 Nút lưu tất cả */}
      <span className="btn btn-success mt-3" onClick={handleSaveAll}>
        Lưu tất cả biến thể
      </span>
    </div>
  );
};

export default VariantProduct;
