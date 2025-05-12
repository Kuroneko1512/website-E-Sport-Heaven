import { ChangeEvent } from "react";
import { useOutletContext } from "react-router-dom";

interface Product {
  price: number;
  discount_percent: string;
  sku: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: string;
  stock: number;
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

interface ContextType {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const ValueProduct = () => {
  const { product, setProduct, errors, setErrors } = useOutletContext<ContextType>();

  // Khai báo context bên ngoài các hàm và hook
  let contextValue: ContextType | null = null;
  try {
    contextValue = useOutletContext<ContextType>();
  } catch (err) {
    console.error("Lỗi khi lấy context:", err);
    setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!");
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "price" ? Number(value) : value,
    }));

    // Xóa lỗi khi người dùng chỉnh sửa trường
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="card card-default">
      <div className="card-header">
        <h3 className="card-title">Chi tiết sản phẩm</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Giá:</label>
              <input 
                type="number" 
                className="form-control"
                name="price" 
                value={product.price} 
                onChange={handleChange}
                min="0" 
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Số lượng:</label>
              <input 
                type="number" 
                className="form-control"
                name="stock" 
                value={product.stock} 
                onChange={handleChange}
                min="1" 
              />
              {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">
              <label>Giảm giá:</label>
              <select 
                name="discount_percent" 
                className="form-control"
                value={product.discount_percent} 
                onChange={handleChange}
              >
                <option value="0" selected>Chọn</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
                <option value="25">25%</option>
                <option value="30">30%</option>
                <option value="35">35%</option>
                <option value="40">40%</option>
                <option value="45">45%</option>
                <option value="50">50%</option>
              </select>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueProduct;
