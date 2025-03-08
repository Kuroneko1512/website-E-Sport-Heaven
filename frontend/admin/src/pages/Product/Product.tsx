import { Link } from "react-router-dom";
import { getProducts, deleteProduct, Pagination } from "@app/services/Product/Api";
import { useEffect, useState } from "react";

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
  selected_attributes: [];
  variants: [];
}

const Product = () => {
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 5,
    data: [],
  });

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts(pagination.current_page, pagination.per_page);
        setProducts(response.data.data);
        setPagination((prev) => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination.current_page]); // 🔥 Chỉ gọi khi current_page thay đổi

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl overflow-x-auto bg-white shadow-lg rounded-lg p-5">
        <h1 className="text-3xl font-bold mb-5 text-center">Trang Sản Phẩm</h1>

        <Link to="/add-product" className="btn btn-success mb-4">
          + Add
        </Link>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Danh sách sản phẩm</h3>
            <div className="card-tools">
              <div className="input-group input-group-sm search-box">
                <input type="text" className="form-control search-input" placeholder="Search" />
                <div className="input-group-append">
                  <button type="submit" className="btn btn-default search-button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.product_type}</td>
                    <td>
                      <span className={`tag ${product.status === "active" ? "tag-success" : "tag-danger"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="card-footer clearfix">
            <ul className="pagination pagination-sm m-0 float-right">
              <li className={`page-item ${!pagination.prev_page_url && "disabled"}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={!pagination.prev_page_url}
                >
                  Pre
                </button>
              </li>

              {[...Array(pagination.last_page)].map((_, i) => (
                <li key={i} className={`page-item ${pagination.current_page === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPagination((prev) => ({ ...prev, current_page: i + 1 }))}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${!pagination.next_page_url && "disabled"}`}>
                <button
                  className="page-link"
                  onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={!pagination.next_page_url}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
