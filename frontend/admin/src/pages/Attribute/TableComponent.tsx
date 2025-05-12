import { Attribute, Pagination } from "@app/services/Attribute/ApiAttribute";
import { deleteAttribute } from "@app/services/Attribute/ApiAttribute";
interface TableComponentProps {
  attributes: Attribute[];
  pagination: {
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
    per_page: number;
    data: Attribute[];
  };
  setEditingAttribute: (attribute: Attribute | null) => void;
  refreshAttributes: (page?: number) => void;
  loading: boolean;
  onSelectAttribute: (attributeId: number | null) => void;
}
const TableComponent = ({
  attributes,
  pagination,
  setEditingAttribute,
  refreshAttributes,
  onSelectAttribute,
  loading,
}:TableComponentProps) => {
  
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa không?")) return;
    try {
      await deleteAttribute(id);
      alert("Xóa thành công!");
      refreshAttributes(); // Làm mới danh sách sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Xóa thất bại!");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Thuộc tính</h3>
      </div>
      <div className="card-body">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {attributes.length > 0 ? (
              attributes.map((attr) => (
                <tr key={attr.id} >
                  <td>{attr.id}</td>
                  <td onClick={() => onSelectAttribute(attr.id)} style={{ cursor: "pointer" }}>{attr.name}</td>
                  <td>{attr.description}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditingAttribute(attr)} // Gửi dữ liệu sang Form
                    >
                      Sửa
                    </button>

                    {attr.attribute_values_count === 0 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(attr.id)}
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
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="card-footer clearfix">
        <ul className="pagination pagination-sm m-0 float-right">
          <li className={`page-item ${!pagination.prev_page_url && "disabled"}`}>
            <button
              className="page-link"
              onClick={() => refreshAttributes(pagination.current_page - 1)}
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
              <button className="page-link" onClick={() => refreshAttributes(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${!pagination.next_page_url && "disabled"}`}>
            <button
              className="page-link"
              onClick={() => refreshAttributes(pagination.current_page + 1)}
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
