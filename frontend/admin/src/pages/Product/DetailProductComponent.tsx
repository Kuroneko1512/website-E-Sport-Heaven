import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { getProductById } from "@app/services/Product/Api";
import ReactQuill from "react-quill";
import { getCategory, Category } from "@app/services/Category/ApiCategory";
import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";

interface Variant {
  price: number;
  stock: number;
  image?: File | string | null;
  attributes: AttributeSelection[];
}

interface AttributeSelection {
  attribute_id: number;
  attribute_value_id: number;
}

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  discount_percent?: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: number;
  sku: string;
  stock: number;
  image?: File | null;
  selected_attributes: AttributeSelection[];
  variants: Variant[];
}

const DetailProductComponent = () => {
  const { id } = useParams();
  const API_BASE_URL = "http://127.0.0.1:8000/storage/";

  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        setProduct(response.data);
        console.log(response.data);

        // Cập nhật ảnh nếu có
        if (response.data.image) {
          setImage(`${API_BASE_URL}${response.data.image}`);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    if (id) {
      fetchProduct();
    }
    const fetchData = async () => {
      try {
        const response = await getCategory();
        setCategories(response.data.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="container-fluid bg-white p-4">
      <h3>CHI TIẾT SẢN PHẨM</h3>
      <div className="row">
        <div className="col-md-8">
          <h4>{product?.name}</h4>
          <ReactQuill value={product?.description} readOnly theme="snow" />
          <p>
            { product?.price == null ? "" : <><strong>Giá:</strong> {product?.price} VND</> } 
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {product?.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </p>
          <p>
            {product?.variants.length > 0 ? product?.variants.map((variant, index) => (
              <div key={index} className="mb-3">
                <strong>Biến thể {index + 1}:</strong>
                <div className="ms-3">
                  <div className="d-flex align-items-center">
                    {variant.product_attributes.map((attribute, index) => (
                      <span key={index}>
                        {attribute.attribute_value.value}
                        {index < variant.product_attributes.length - 1 && <span className="mx-2">-</span>}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">
                    <p className="me-3">Giá: {variant.price} VND</p>
                    <p>Số lượng: {variant.stock}</p>
                  </div>
                </div>
              </div>
            )) : "Không có biến thể"}
          </p>
        </div>
        <div className="col-md-4">
          x
          <img
            src={image || NoImage}
            alt={product?.name}
            className="w-100 rounded"
            style={{ maxHeight: "300px" }}
          />
          <p>
            <strong>Danh mục:</strong>{" "}
            {
              categories.find((category) => category.id === product.category_id)
                ?.name
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailProductComponent;
