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

interface ContextType {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
}

const ValueProduct = () => {
  const { product, setProduct } = useOutletContext<ContextType>();

  if (!product) {
    return <p>Loading...</p>;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "price" ? Number(value) : value,
    }));
  };

  return (
    <div className="card card-default">
      <div className="card-header">
        <h3 className="card-title">Product Details</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Price:</label>
              <input type="number" className="form-control" name="price" value={product.price} onChange={handleChange} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Stock:</label>
              <input type="number" className="form-control" name="stock" value={product.stock} onChange={handleChange} />
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">
              <label>Sale:</label>
              <select name="discount_percent" className="form-control" value={product.discount_percent} onChange={handleChange}>
                <option value="">Chọn</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ValueProduct;
