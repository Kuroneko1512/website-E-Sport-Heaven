import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import BlogCategoryService from '@app/services/Blog/BlogCategoryService';

interface BlogCategory {
  id?: number;
  name: string;
  description: string;
}

const DetailBlogCategory = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BlogCategory>({} as BlogCategory);
  const [loading, setLoading] = useState(false);
  const action: 'create' | 'update' | 'view' = id
    ? location.pathname.includes('edit')
      ? 'update'
      : 'view'
    : 'create';

  useEffect(() => {
    const fetchCategory = async () => {      
      if (id && action !== 'create') {
        try {
          const response = await BlogCategoryService.getById(Number(id));          
          setFormData({
            name: response.name || '',
            description: response.description || ''
          });
        } catch (error) {
          console.error('Lỗi khi tải danh mục:', error);
          toast.error('Không thể tải danh mục');
        }
      }
    };

    fetchCategory();
  }, [id, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      if (action === 'update') {
        await BlogCategoryService.update(Number(id), formData);
        toast.success('Cập nhật danh mục thành công!');
      } else if (action === 'create') {
        await BlogCategoryService.create({
          name: formData.name,
          description: formData.description,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-')
        });
        toast.success('Tạo danh mục thành công!');
      }
      navigate(-1);
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      toast.error(action === 'update' ? 'Không thể cập nhật danh mục' : 'Không thể tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {action === 'view' ? 'Xem' : action === 'update' ? 'Chỉnh sửa' : 'Thêm'} Danh mục Blog
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="name">Tên</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Nhập tên danh mục"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={action === 'view'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder="Nhập mô tả danh mục"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={action === 'view'}
            />
          </div>
        </div>
        <div className="card-footer">
          {action !== 'view' && (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </button>
          )}
          <button
            type="button"
            className="btn btn-default ml-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            {action === 'view' ? 'Quay lại' : 'Hủy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailBlogCategory;
