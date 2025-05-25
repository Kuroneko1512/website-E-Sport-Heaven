import { useState } from "react";
import { toast } from 'react-toastify';
import {
  CategoryService,
  Category,
  Pagination,
} from "@app/services/Category/CategoryApi";
import { useNavigate } from "react-router-dom";

interface TableComponentProps {
  categories: Category[];
  refreshCategories: (page?: number) => void;
  pagination: Pagination;
  setEditingCategory: (category: Category | null) => void;
}

const TableComponent = ({
  categories,
  refreshCategories,
  pagination,
  setEditingCategory,
}: TableComponentProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      // Kiểm tra điều kiện xóa
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        toast.error("Không tìm thấy danh mục!");
        return;
      }

      const productsCount = category.products_count ?? 0;
      const subcategoriesCount = category.subcategories_count ?? 0;
  
      if (productsCount > 0 || subcategoriesCount > 0) {
        toast.error("Không thể xóa danh mục có chứa sản phẩm hoặc danh mục con!");
        return;
      }
      // Xác nhận xóa
      if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

      setLoading(true);
      await CategoryService.delete(id);
      toast.success("Xóa danh mục thành công!");
      refreshCategories(pagination.current_page);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Xóa danh mục thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Component cho hàng trong bảng
  const TableRow = ({ cat }: { cat: Category }) => (
    <tr key={cat.id}>
      <td>{cat.id}</td>
      <td>{cat.name}</td>
      <td>{cat.description}</td>
      <td className="d-flex gap-2">
        <button
          className="btn btn-warning btn-sm"
          onClick={() => setEditingCategory(cat)}
          disabled={loading}
        >
          <i className="fas fa-edit"></i> Sửa
        </button>
        {cat.products_count === 0 && cat.subcategories_count === 0 && (
          <button
            type="button"
            onClick={() => handleDelete(cat.id)}
            className="btn btn-danger btn-sm"
            disabled={loading}
          >
            <i className="fas fa-trash"></i> Xóa
          </button>
        )}
      </td>
    </tr>
  );

  // Component phân trang
  const PaginationControls = () => (
    <div className="card-footer clearfix">
      <ul className="pagination pagination-sm m-0 float-right">
        <li className={`page-item ${!pagination.prev_page_url ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => refreshCategories(pagination.current_page - 1)}
            disabled={!pagination.prev_page_url || loading}
          >
            <i className="fas fa-chevron-left"></i> Trước
          </button>
        </li>

        {[...Array(pagination.last_page)].map((_, i) => (
          <li
            key={i}
            className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => refreshCategories(i + 1)}
              disabled={loading}
            >
              {i + 1}
            </button>
          </li>
        ))}

        <li className={`page-item ${!pagination.next_page_url ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => refreshCategories(pagination.current_page + 1)}
            disabled={!pagination.next_page_url || loading}
          >
            Tiếp <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Danh mục sản phẩm</h3>
        <div className="card-tools">
          {/* <button 
            className="btn btn-primary btn-sm"
            onClick={() => setEditingCategory(null)}
          >
            <i className="fas fa-plus"></i> Thêm mới
          </button> */}
        </div>
      </div>

      <div className="card-body table-responsive p-0">
        {loading && (
          <div className="overlay">
            <i className="fas fa-sync fa-spin"></i>
          </div>
        )}
        
        <table className="table table-hover text-nowrap">
          <thead>
            <tr>
              <th style={{ width: "10px" }}>Id</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th style={{ width: "150px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <TableRow key={cat.id} cat={cat} />
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

      <PaginationControls />
    </div>
  );
};

export default TableComponent;