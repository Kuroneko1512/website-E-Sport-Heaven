import { useState, useEffect } from "react";
import {
  getAttributes,
  Attribute,
  Pagination,
} from "@app/services/Attribute/ApiAttribute";
import { useNavigate } from "react-router-dom";

import { deleteAttribute } from "@app/services/Attribute/ApiAttribute"; // Import API xóa
const TableComponent = () => {
  const navigate = useNavigate();
  // State lưu thông tin phân trang
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1, // Mặc định trang đầu tiên
    last_page: 1, // Tổng số trang ban đầu là 1
    prev_page_url: null, // Chưa có trang trước
    next_page_url: null, // Chưa có trang sau
    total: 0, // Tổng số records ban đầu là 0
    per_page: 5, // Mặc định 5 records trên mỗi trang
    data: [],
  });
  // State lưu danh sách attributes
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API
  // Gọi API lấy danh sách attributes
  const handleDelete = async (id: number) => {
    // if (id === undefined) {
    //   alert("ID không hợp lệ!");
    //   return;
    // }
    if (!window.confirm("Bạn có chắc chắn muốn xóa không?")) return;

    try {
      
      if (id) {
        console.log(id);
        
        await deleteAttribute(id);
      }
    
      alert("Xóa thành công!");
      fetchData(); // Gọi lại API để cập nhật danh sách mà không cần reload trang
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Xóa thất bại!");
    }
  };
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAttributes(page, pagination.per_page);

      console.log("API Response:", response); // Kiểm tra API trả về gì

      setAttributes(response.data.data); //  Chỉ gán danh sách attributes (là mảng)
      setPagination(response.data); //  Cập nhật thông tin phân trang
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
    setLoading(false);
  };

  // Gọi API khi component được mount lần đầu
  useEffect(() => {
    fetchData();
  }, []); // Chạy một lần khi component render lần đầu

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Attribute</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th style={{ width: "10px" }}>Id</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => (
                <tr key={attr.id}>
                  <td>{attr.id}</td>
                  <td>{attr.name}</td>
                  <td>{attr.description}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => navigate(`attribute/edit/${attr.id}`)}
                    >
                      Edit
                    </button>
                  </td>

                
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(attr.id)}
                        className="btn btn-danger btn-sm"
                      >
                        DELETE
                      </button>
                    </td>
              
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="card-footer clearfix">
        <ul className="pagination pagination-sm m-0 float-right">
          <li
            className={`page-item ${!pagination.prev_page_url && "disabled"}`}
          >
            <button
              className="page-link"
              onClick={() => fetchData(pagination.current_page - 1)}
              disabled={!pagination.prev_page_url}
            >
              Pre
            </button>
          </li>

          {[...Array(pagination.last_page)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${pagination.current_page === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => fetchData(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${!pagination.next_page_url && "disabled"}`}
          >
            <button
              className="page-link"
              onClick={() => fetchData(pagination.current_page + 1)}
              disabled={!pagination.next_page_url}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TableComponent;
