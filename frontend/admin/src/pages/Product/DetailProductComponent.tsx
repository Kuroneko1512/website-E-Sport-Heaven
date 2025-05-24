import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { getProductById } from "@app/services/Product/Api";
import ReactQuill from "react-quill";
import { getAllCategories, Category } from "@app/services/Category/ApiCategory";
import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
import FomatVND from "@app/utils/FomatVND";

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

  // Hàm tính giá bán sau khi giảm giá
  const calculateSalePrice = (price: number, discountPercent: string | undefined) => {
    if (!discountPercent || discountPercent === "0") return price;
    const discount = parseFloat(discountPercent) / 100;
    return price - (price * discount);
  };

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

    // Sử dụng API lấy tất cả danh mục không phân trang
    const fetchData = async () => {
      try {
        const response = await getAllCategories();
        const categoriesData = response.data.data || [];
        setCategories(categoriesData);
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{product?.name}</h4>
            {/* Hiển thị trạng thái giống trang list */}
            <span
              className={`badge ${product?.status === "active" ? "bg-success" : "bg-danger"}`}
              style={{ padding: "6px 12px", fontSize: "14px" }}
            >
              {product?.status === "active" ? "Đang bán" : "Ngừng bán"}
            </span>
          </div>

          {/* Hiển thị loại sản phẩm */}
          <div className="mb-3">
            <span className="badge bg-info">
              {product?.product_type === "variable" ? "Sản phẩm biến thể" : "Sản phẩm đơn giản"}
            </span>
          </div>

          {/* Thông tin chi tiết sản phẩm dạng bảng */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Thông tin giá</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Giá nhập</th>
                    <th>Giảm giá</th>
                    <th>Giá bán</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {product?.product_type === "simple" ? (
                    <tr>
                      <td>{FomatVND(product?.price || 0)}</td>
                      <td>{product?.discount_percent ? `${product.discount_percent}%` : "0%"}</td>
                      <td>{FomatVND(calculateSalePrice(product?.price || 0, product?.discount_percent))}</td>
                      <td>{product?.stock || 0}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Xem chi tiết giá trong phần biến thể bên dưới
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Mô tả sản phẩm</h5>
            </div>
            <div className="card-body">
              <ReactQuill value={product?.description} readOnly theme="snow" />
            </div>
          </div>

          {/* Biến thể sản phẩm */}
          {product?.product_type === "variable" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Biến thể sản phẩm</h5>
              </div>
              <div className="card-body p-0">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Thuộc tính</th>
                      <th>Giá nhập</th>
                      <th>Giảm giá</th>
                      <th>Giá bán</th>
                      <th>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product?.variants.length > 0 ? (
                      product.variants.map((variant, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {variant.product_attributes.map((attribute, attrIndex) => (
                              <span key={attrIndex}>
                                {attribute.attribute_value.value}
                                {attrIndex < variant.product_attributes.length - 1 && <span className="mx-1">-</span>}
                              </span>
                            ))}
                          </td>
                          <td>{FomatVND(variant.price)}</td>
                          <td>{variant.discount_percent ? `${variant.discount_percent}%` : "0%"}</td>
                          <td>{FomatVND(calculateSalePrice(variant.price, variant.discount_percent))}</td>
                          <td>{variant.stock}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">Không có biến thể</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Hình ảnh sản phẩm</h5>
            </div>
            <div className="card-body text-center">
              <img
                src={image || NoImage}
                alt={product?.name}
                className="img-fluid rounded"
                style={{ maxHeight: "300px" }}
              />
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">Thông tin khác</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Danh mục:</span>
                  <span className="text-primary">
                    {categories.find((category) => category.id === product?.category_id)?.name || "Không có"}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Mã SKU:</span>
                  <span>{product?.sku || "Không có"}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Ngày tạo:</span>
                  <span>{product?.created_at ? new Date(product.created_at).toLocaleDateString() : "Không có"}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Cập nhật:</span>
                  <span>{product?.updated_at ? new Date(product.updated_at).toLocaleDateString() : "Không có"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProductComponent;
