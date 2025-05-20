import { PaginatedResponse } from '@app/services/BaseApi';
import ReviewService, { Review } from '@app/services/Review/ReviewService';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const StarRating = ({ rating }) => {
  return (
    <div className="ml-2 text-yellow-500">
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={`fas fa-star ${
            index < rating ? "text-yellow-500" : "text-gray-300"
          }`}
        ></i>
      ))}
    </div>
  );
};

const ReviewList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Review>>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 10,
    data: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await ReviewService.getAll(page);
      console.log(response.data);
      
      setReviews(response.data);
      setPagination(response);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const review = reviews.find(r => r.id === id);
      if (!review) {
        toast.error('Không tìm thấy đánh giá!');
        return;
      }

      if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

      setLoading(true);
      await ReviewService.delete(id);
      toast.success('Xóa đánh giá thành công!');
      fetchReviews(pagination.current_page);
    } catch (error) {
      console.error('Lỗi khi xóa đánh giá:', error);
      toast.error('Không thể xóa đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Danh sách đánh giá</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to={'/'}>Trang Chủ</Link>
                </li>
                <li className="breadcrumb-item active">Danh sách đánh giá</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách đánh giá</h3>
          <div className="card-tools d-flex align-items-center" >
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
                <th>Tiêu đề</th>
                <th>Sản phẩm</th>
                <th>User</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.title}</td>
                    <td>{review.product_name}</td>
                    <td><StarRating rating={review.rating} /></td>
                    <td>{review.user_name}</td>
                    <td>
                      <Link
                        to={`/review/${review.id}`}
                        className="btn btn-warning btn-sm mr-2"
                      >
                        <i className="fas fa-edit"></i> Sửa
                      </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(review.id)}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    Không tìm thấy đánh giá nào
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
                onClick={() => fetchReviews(pagination.current_page - 1)}
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
                  onClick={() => fetchReviews(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${!pagination.next_page_url ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => fetchReviews(pagination.current_page + 1)}
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

export default ReviewList;
