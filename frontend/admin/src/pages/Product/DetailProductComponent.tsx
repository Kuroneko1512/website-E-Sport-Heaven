import { useState, useEffect, ChangeEvent } from "react";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { getProductById } from "@app/services/Product/Api";
import ReactQuill from "react-quill";
import { getCategory, Category } from "@app/services/Category/ApiCategory";
import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
import { createProduct } from "@app/services/Product/Api";
import Select, { SingleValue } from "react-select";

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
  category_id: string;
  stock: number;
  image?: File | null;
  selected_attributes: AttributeSelection[];
  variants: Variant[];
}

const DetailProductComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE_URL = "http://127.0.0.1:8000/storage/";

  // 🟢 Di chuyển state lên đầu component
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
        console.log(image);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCategory();
        setCategories(response.data.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchData();
  }, []);

  if (!product) {
    return <p>Đang tải dữ liệu...</p>;
  }

  return (
    <div className="container-fluid bg-white p-4">
      <h3>CHI TIẾT SẢN PHẨM</h3>
      <div className="row">
        <div className="col-md-8">
          <h4>{product.name}</h4>
          <ReactQuill value={product.description} readOnly theme="snow" />
          <p>
            <strong>Giá:</strong> {product.price} VND
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {product.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </p>
        </div>
        <div className="col-md-4">
          <img
            src={image || NoImage}
            alt={product.name}
            className="w-100 rounded"
            style={{ maxHeight: "300px" }}
          />
          <p>
            <strong>Danh mục:</strong> {product.category_id}
          </p>
        </div>
      </div>
      <div className="btn-edit">
        <button
          className="btn btn-primary "
          onClick={() => navigate(`/Product/edit/${product.id}`)}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default DetailProductComponent;
