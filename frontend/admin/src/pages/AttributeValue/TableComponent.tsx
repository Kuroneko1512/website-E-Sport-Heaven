import {
  CategoryService,
  Category,
  Pagination,
} from "@app/services/Category/CategoryApi";
import { useNavigate } from "react-router-dom";

interface TableComponentProps {
  categories: Category[];
  refreshCategories: (page?: number) => void; // Hàm cập nhật danh sách danh mục
  pagination: Pagination; // Nhận dữ liệu phân trang từ cha
  setEditingCategory: (category: Category | null) => void;
}

const TableComponent = ({
  categories,
  refreshCategories,
  pagination,
  setEditingCategory,
}: TableComponentProps) => {
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa không?")) return;
    try {
      await CategoryService.delete(id);
      alert("Xóa thành công!");
      refreshCategories(pagination.current_page); // Giữ nguyên trang sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Xóa thất bại!");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Danh mục sản phẩm</h3>
      </div>
      <div className="card-body">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ width: "10px" }}>Id</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditingCategory(cat)}
                    >
                      Sửa
                    </button>
                    {cat.products_count === 0 &&
                      cat.subcategories_count === 0 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="btn btn-danger btn-sm ml-2"
                        >
                          Xóa
                        </button>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  Không có danh mục nào!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="card-footer clearfix">
        <ul className="pagination pagination-sm m-0 float-right">
          <li
            className={`page-item ${!pagination.prev_page_url && "disabled"}`}
          >
            <button
              className="page-link"
              onClick={() => refreshCategories(pagination.current_page - 1)}
              disabled={!pagination.prev_page_url}
            >
              Trước
            </button>
          </li>
          {[...Array(pagination.last_page)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${pagination.current_page === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => refreshCategories(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${!pagination.next_page_url && "disabled"}`}
          >
            <button
              className="page-link"
              onClick={() => refreshCategories(pagination.current_page + 1)}
              disabled={!pagination.next_page_url}
            >
              Tiếp
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TableComponent;
