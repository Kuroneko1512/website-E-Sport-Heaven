import { Link, useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  Pagination,
  api4,
} from "@app/services/Product/Api";
import { useEffect, useState } from "react";
import FomatVND from "@app/utils/FomatVND";

const Product = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 5,
    data: [],
  });

  const [products, setProducts] = useState<api4[]>([]);
  const [isDelete, setIsDelete] = useState(false);

  const handleDeleteProduct = async (id: number) => {
    try {
      // Xác nhận trước khi xóa
      const confirm = window.confirm(
        "Bạn có chắc chắn muốn xóa sản phẩm này không?"
      );
      if (!confirm) return;

      await deleteProduct(id);

      // Cập nhật lại dữ liệu sau khi xóa thành công
      setProducts(products.filter((product) => product.id !== id));

      // Hiển thị thông báo xóa thành công
      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Xóa sản phẩm thất bại!");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts(
          pagination.current_page,
          pagination.per_page
        );
        setProducts(response.data.data);
        setPagination((prev) => ({
          ...prev,
          current_page: response.current_page,
          last_page: response.last_page,
          prev_page_url: response.prev_page_url,
          next_page_url: response.next_page_url,
          total: response.total,
          per_page: response.per_page,
          data: response.data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination.current_page, isDelete]); // 🔥 Thêm isDelete để load lại khi xóa

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Danh sách đơn hàng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to={"/"}>Trang chủ</Link>
                </li>
                <li className="breadcrumb-item active">Đơn hàng</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Đơn hàng</h3>
          <div className="card-tools">
            <Link to="/add-product" className="btn btn-success me-2">
              + Thêm
            </Link>
          </div>
        </div>

        <div className="card-body p-0">
          <table className="table table-hover text-nowrap">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    {FomatVND(
                      product.variants.length > 0
                        ? product.variants[0].price
                        : product.price
                    )}
                  </td>
                  <td>
                    {product.product_type === "variable"
                      ? "Biến thể"
                      : "Đơn giản"}
                  </td>
                  <td>
                    <span
                      className={`tag ${product.status === "active" ? "tag-success" : "tag-danger"}`}
                    >
                      {product.status === "active" ? "Đang bán" : "Ngừng"}
                    </span>
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`detail/${product.id}`)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/add-product/${product.id}`)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm mx-2"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Product;
