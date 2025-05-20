import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import ReviewService, { Review } from '@app/services/Review/ReviewService';

const DetailReview = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
   const [review, setReview] = useState<Review | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
        try {
          const response = await ReviewService.getById(Number(id));
          setReview(response);
        } catch (error) {
          console.error("Lỗi khi tải danh mục:", error);
          toast.error("Không thể tải danh mục");
        }
    };

    fetchReview();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Chi tiết đánh giá
        </h3>
      </div>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="name">
              Tiêu đề
            </label>
            <p>
              {review?.title}
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="name">
              Sản phẩm
            </label>
            <p>
              {review?.product_name}
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="name">
              User
            </label>
            <p>
              {review?.user_name}
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="name">
              Bình luận
            </label>
            <p>
              {review?.comment}
            </p>
          </div>
        </div>
        <div className="card-footer">
          <button
            type="button"
            className="btn btn-default ml-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Quay lại
          </button>
        </div>
    </div>
  );
};

export default DetailReview;
