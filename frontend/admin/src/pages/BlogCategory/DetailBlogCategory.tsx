import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import BlogCategoryService from "@app/services/Blog/BlogCategoryService";

interface BlogCategory {
  id?: number;
  name: string;
  description: string;
}

interface FormData {
  name: string;
  description: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  description: "",
};
const INITIAL_ERRORS: Record<keyof FormData, string> = {
  name: "",
  description: "",
};

const DetailBlogCategory = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BlogCategory>({} as BlogCategory);
  const [errors, setErrors] = useState<Record<keyof FormData, string>>(
    {} as Record<keyof FormData, string>
  );
  const [loading, setLoading] = useState(false);
  const action: "create" | "update" | "view" = id
    ? location.pathname.includes("edit")
      ? "update"
      : "view"
    : "create";

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors(INITIAL_ERRORS);
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      if (id && action !== "create") {
        try {
          const response = await BlogCategoryService.getById(Number(id));
          setFormData({
            name: response.name || "",
            description: response.description || "",
          });
        } catch (error) {
          console.error("Lỗi khi tải danh mục:", error);
          toast.error("Không thể tải danh mục");
        }
      }
    };

    fetchCategory();
  }, [id, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!formData.name.trim()) {
      toast.error("Tên danh mục là bắt buộc");
      return;
    }

    try {
      setLoading(true);
      if (action === "update") {
        await BlogCategoryService.update(Number(id), formData);
        toast.success("Cập nhật danh mục thành công!");
      } else if (action === "create") {
        await BlogCategoryService.create({
          name: formData.name,
          description: formData.description,
          slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
        });
        toast.success("Tạo danh mục thành công!");
        resetForm();
      }
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      toast.error(
        action === "update"
          ? "Không thể cập nhật danh mục"
          : "Không thể tạo danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Name validation
    if (!formData.name || formData.name.length === 0) {
      newErrors.name = "Tên danh mục không được để trống";
    } else if (formData.name.length > 255) {
      newErrors.name = "Tên danh mục không được vượt quá 255 ký tự";
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    setErrors(newErrors as Record<keyof FormData, string>);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {action === "view"
            ? "Xem"
            : action === "update"
              ? "Chỉnh sửa"
              : "Thêm"}{" "}
          Danh mục Blog
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="name">
              Tên danh mục <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              disabled={action === "view"}
            />
            {errors.name && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {errors.name}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder="Nhập mô tả danh mục"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={action === "view"}
            />
          </div>
        </div>
        <div className="card-footer">
          {action !== "view" && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </button>
          )}
          <button
            type="button"
            className="btn btn-default ml-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            {action === "view" ? "Quay lại" : "Hủy"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailBlogCategory;
