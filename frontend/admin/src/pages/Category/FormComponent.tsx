import { useState, useEffect, useCallback } from "react";
import { CategoryService, Category } from "@app/services/Category/CategoryApi";
import { toast } from "react-toastify";

interface CategoryFormProps {
  onCategoryAdded: () => void;
  editingCategory?: Category | null;
  setEditingCategory: (category: Category | null) => void;
}

interface FormData {
  name: string;
  description: string;
  parent_id: number | undefined;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  description: "",
  parent_id: undefined
};
const INITIAL_ERRORS: Record<keyof FormData, string> = {
  name: '',
  description: '',
  parent_id: ''
};

const CategoryForm = ({ onCategoryAdded, editingCategory, setEditingCategory }: CategoryFormProps) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<keyof FormData, string>>({} as Record<keyof FormData, string>);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors(INITIAL_ERRORS);
  }, []);

  const fetchCategories = async () => {
    try {

      setLoading(true);
      const response = await CategoryService.getAllNoPagination();
      setCategories(response.data.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);

    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parent_id' ? (value ? Number(value) : undefined) : value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    } else if (formData.name.length > 255) {
      newErrors.name = "Tên danh mục không được vượt quá 255 ký tự";
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    // Parent category validation
    if (formData.parent_id) {
      if (!categories.some(cat => cat.id === formData.parent_id)) {
        newErrors.parent_id = "Danh mục cha không hợp lệ";
      }
      if (editingCategory && editingCategory.id === formData.parent_id) {
        newErrors.parent_id = "Danh mục không thể là cha của chính nó";
      }
    }

    setErrors(newErrors as Record<keyof FormData, string>);
    return Object.keys(newErrors).length === 0;
  }, [formData, categories, editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent_id: formData.parent_id
      };

      if (editingCategory) {
        await CategoryService.update(editingCategory.id, submitData);
        toast.success("Cập nhật danh mục thành công!");
        setEditingCategory(null);
      } else {
        // console.log(submitData);
        await CategoryService.create(submitData);
        toast.success("Thêm danh mục thành công!");
       
      }

      resetForm();
      onCategoryAdded();
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        Object.entries(serverErrors).forEach(([key, value]) => {
          toast.error(`${key}: ${(value as string[])[0]}`);
        });
      } else {
        toast.error("Có lỗi xảy ra khi xử lý yêu cầu!");
        console.error("Form submission error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || "",
        parent_id: editingCategory.parent_id
      });
    } else {
      resetForm();
    }
  }, [editingCategory, resetForm]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        </h3>
      </div>
      
      <div className="card-body position-relative">
        {loading && (
          <div className="overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">
              Tên danh mục <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Nhập tên danh mục"
              required
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="description" className="form-label">Mô tả</label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              placeholder="Nhập mô tả danh mục"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="parent_id" className="form-label">Danh mục cha</label>
            <select
              id="parent_id"
              name="parent_id"
              className={`form-control ${errors.parent_id ? "is-invalid" : ""}`}
              value={formData.parent_id || ""}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Không có</option>
              {categories
                .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            {errors.parent_id && (
              <div className="invalid-feedback">{errors.parent_id}</div>
            )}
          </div>

          <div className="form-group d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
               
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className={`fas fa-${editingCategory ? 'save' : 'plus'} me-1`}></i>
                  {editingCategory ? "Cập nhật" : "Thêm mới"}
                </>
              )}
            </button>
            
            {editingCategory && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingCategory(null);
                  resetForm();
                }}
                disabled={loading}
              >
                <i className="fas fa-times me-1"></i>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;