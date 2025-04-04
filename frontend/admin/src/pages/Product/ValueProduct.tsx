import { ChangeEvent, useEffect, useState } from "react";
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
  // Tạo state local để tránh lỗi khi product từ context là undefined
  const [localPrice, setLocalPrice] = useState<number>(0);
  const [localStock, setLocalStock] = useState<number>(1);
  const [localDiscount, setLocalDiscount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Khai báo context bên ngoài các hàm và hook
  let contextValue: ContextType | null = null;
  try {
    contextValue = useOutletContext<ContextType>();
  } catch (err) {
    console.error("Lỗi khi lấy context:", err);
    setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!");
  }

  // Hook useEffect luôn được gọi ở cùng một cấp, không được đặt trong điều kiện
  useEffect(() => {
    if (contextValue && contextValue.product) {
      try {
        setLocalPrice(contextValue.product.price || 0);
        setLocalStock(contextValue.product.stock || 1);
        setLocalDiscount(contextValue.product.discount_percent || "");
      } catch (err) {
        console.error("Lỗi khi đọc dữ liệu sản phẩm:", err);
        setError("Không thể đọc dữ liệu sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [contextValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!contextValue) return;
    
    const { name, value } = e.target;
    
    // Cập nhật state local
    if (name === "price") {
      setLocalPrice(Number(value));
    } else if (name === "stock") {
      setLocalStock(Number(value));
    } else if (name === "discount_percent") {
      setLocalDiscount(value);
    }
    
    
    try {
      contextValue.setProduct((prev) => ({
        ...prev,
        [name]: name === "stock" || name === "price" ? Number(value) : value,
      }));

   
      if (contextValue.errors && contextValue.errors[name as keyof ValidationErrors]) {
        contextValue.setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật dữ liệu:", err);
      setError("Không thể cập nhật dữ liệu sản phẩm.");
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <p>Đang tải dữ liệu sản phẩm...</p>;
  }

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
                className={`form-control ${contextValue?.errors?.price ? 'is-invalid' : ''}`}
                name="price" 
                value={localPrice} 
                onChange={handleChange}
                min="0" 
              />
              {contextValue?.errors?.price && <div className="invalid-feedback">{contextValue.errors.price}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Số lượng:</label>
              <input 
                type="number" 
                className={`form-control ${contextValue?.errors?.stock ? 'is-invalid' : ''}`}
                name="stock" 
                value={localStock} 
                onChange={handleChange}
                min="1" 
              />
              {contextValue?.errors?.stock && <div className="invalid-feedback">{contextValue.errors.stock}</div>}
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">
              <label>Giảm giá:</label>
              <select 
                name="discount_percent" 
                className="form-control"
                value={localDiscount} 
                onChange={handleChange}
              >
                <option value="">Chọn</option>
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
