import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import BlogService, { BlogPost } from '@app/services/Blog/BlogService';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<any>({
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

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await BlogService.getAll({ page, keyword: searchTerm });
      setPosts(response.data);
      setPagination(response);
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

      setLoading(true);
      await BlogService.delete(id);
      toast.success('Xóa bài viết thành công!');
      fetchPosts(pagination.current_page);
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      toast.error('Không thể xóa bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Bài Viết Blog</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to={'/'}>Trang Chủ</Link>
                </li>
                <li className="breadcrumb-item active">Bài Viết Blog</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Bài Viết Blog</h3>
          <div className="card-tools d-flex align-items-center">
            <Link to="/add-blog" className="btn btn-primary btn-sm mr-2">
              <i className="fas fa-plus"></i> Tạo Bài Viết
            </Link>
            <div className="input-group input-group-sm" style={{ width: '150px' }}>
              <input
                type="text"
                name="table_search"
                className="form-control float-right"
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-default" onClick={() => fetchPosts()}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body table-responsive p-0">
          {loading && (
            <div className="overlay">
              <i className="fas fa-sync fa-spin"></i>
            </div>
          )}

          <table className="table table-hover text-nowrap ">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh Thu Nhỏ</th>
                <th>Tiêu Đề</th>
                <th>Danh Mục</th>
                <th>Trạng Thái</th>
                <th>Nổi Bật</th>
                <th>Ngày Tạo</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td>
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '5px',
                          objectFit: 'cover',
                          overflow: 'hidden'
                        }}
                      />
                    </td>
                    <td>{post.title}</td>
                    <td>{post.category?.name}</td>
                    <td>
                      <span className={`badge badge-${post.status === 'published' ? 'success' : 'warning'}`}>
                        {post.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${post.is_featured ? 'success' : 'danger'}`}>
                        {post.is_featured ? 'Có' : 'Không'}
                      </span>
                    </td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link
                        to={`/edit-blog/${post.id}`}
                        className="btn btn-warning btn-sm mr-2"
                      >
                        <i className="fas fa-edit"></i> Sửa
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(post.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    Không tìm thấy bài viết nào
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
                onClick={() => fetchPosts(pagination.current_page - 1)}
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
                  onClick={() => fetchPosts(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${!pagination.next_page_url ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => fetchPosts(pagination.current_page + 1)}
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

export default Blog;