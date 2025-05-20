import { PaginatedResponse } from '@app/services/BaseApi';
import ReviewService, { BlogCategories } from '@app/services/Blog/ReviewService';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Review = () => {
  const [categories, setCategories] = useState<BlogCategories[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<BlogCategories>>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 10,
    data: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await ReviewService.getAll(page);
      console.log(response.data);
      
      setCategories(response.data);
      setPagination(response);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        toast.error('Không tìm thấy danh mục!');
        return;
      }

      if (category.posts_count && category.posts_count > 0) {
        toast.error('Không thể xóa danh mục đang có bài viết!');
        return;
      }

      if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

      setLoading(true);
      await ReviewService.delete(id);
      toast.success('Xóa danh mục thành công!');
      fetchCategories(pagination.current_page);
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      toast.error('Không thể xóa danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Danh Mục Blog</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to={'/'}>Trang Chủ</Link>
                </li>
                <li className="breadcrumb-item active">Danh Mục Blog</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh Mục Blog</h3>
          <div className="card-tools d-flex align-items-center" >
            <Link to="/add-blog-category" className="btn btn-primary btn-sm mr-2">
              <i className="fas fa-plus"></i> Tạo Danh Mục
            </Link>
            {/* <div className="input-group input-group-sm" style={{ width: '150px' }}>
              <input
                type="text"
                name="table_search"
                className="form-control float-right"
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-default">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div> */}
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
                <th>ID</th>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Số Bài Viết</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>{category.posts_count || 0}</td>
                    <td>
                      <Link
                        to={`/edit-blog-category/${category.id}`}
                        className="btn btn-warning btn-sm mr-2"
                      >
                        <i className="fas fa-edit"></i> Sửa
                      </Link>
                      {(!category.posts_count || category.posts_count === 0) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer clearfix">
          <ul className="pagination pagination-sm m-0 float-right">
            <li className={`page-item ${!pagination.prev_page_url ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => fetchCategories(pagination.current_page - 1)}
                disabled={!pagination.prev_page_url || loading}
              >
                «
              </button>
            </li>
            {[...Array(pagination.last_page)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => fetchCategories(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${!pagination.next_page_url ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => fetchCategories(pagination.current_page + 1)}
                disabled={!pagination.next_page_url || loading}
              >
                »
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Review;
