import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BlogPost } from "@app/services/Blog/BlogService";
import BlogCategoryService, {
  BlogCategories,
} from "@app/services/Blog/BlogCategoryService";
import BlogService from "@app/services/Blog/BlogService";
import Loading from "@app/components/loading-container/loading";

interface FormData {
  title: string;
  content: string;
  thumbnail?: string;
  pushish_date?: string;
  category_id?: number;
}

const INITIAL_FORM_DATA: FormData = {
  title: "",
  content: "",
};

const DetailBlog = () => {
  const quillRef: any = useRef();
  const NoImage =
    "/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const action: "create" | "update" | "view" = id
    ? location.pathname.includes("edit")
      ? "update"
      : "view"
    : "create";

  const [formData, setFormData] = useState<BlogPost>({} as BlogPost);
  const [categories, setCategories] = useState<BlogCategories[]>([]);
  const [errors, setErrors] = useState<Record<keyof FormData, string>>(
    {} as Record<keyof FormData, string>
  );
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await BlogCategoryService.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        toast.error("Không thể tải danh mục");
      }
    };

    fetchCategories();
  }, []);

  // Fetch blog post data when id is available and not in create mode
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id || action === "create") {
        setFormData({} as BlogPost);
        return;
      }

      try {
        setLoading(true);
        const blogData = await BlogService.getById(Number(id));
        setFormData({
          title: blogData.title,
          content: blogData.content,
          category_id: blogData.category_id,
          thumbnail: blogData.thumbnail,
          publish_date: blogData.publish_date,
          is_featured: blogData.is_featured,
        } as BlogPost);
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
        toast.error("Không thể tải bài viết");
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id, action]);

    const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Name validation
    if (!formData.title || formData.title.length === 0) {
      newErrors.title = "Tiêu đề không được để trống";
    } else if (formData.title.length > 255) {
      newErrors.title = "Tiêu đề không được vượt quá 255 ký tự";
    }

    // Description validation
    if (!formData.content || formData.content.length === 0) {
      newErrors.content = "Nội dung không được để trống";
    }

    // thumbnail validation
    if (!formData.thumbnail || formData.thumbnail.length === 0) {
      newErrors.thumbnail = "Ảnh không được để trống";
    }

    // publish_date validation
    if (!formData.publish_date || formData.publish_date.length === 0) {
      newErrors.pushish_date = "Ngày xuất bản không được để trống";
    }

    // category_id validation
    if (!formData.category_id) {
      newErrors.category_id = "Danh mục không được để trống";
    }

    setErrors(newErrors as Record<keyof FormData, string>);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const requiredFields = {
      title: "Vui lòng nhập tiêu đề",
      content: "Vui lòng nhập nội dung",
      category_id: "Vui lòng chọn danh mục",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field as keyof BlogPost]?.toString().trim()) {
        toast.error(message);
        return;
      }
    }

    try {
      setLoading(true);

      const formDataToSubmit = {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id?.toString() ?? "1",
        thumbnail: formData.thumbnail?.toString() || "",
        publish_date: formData.publish_date || "",
        is_featured: formData.is_featured ? "1" : "0",
      };

      if (action === "update") {
        await BlogService.update(Number(id), formDataToSubmit);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await BlogService.create(formDataToSubmit);
        toast.success("Tạo bài viết thành công!");
      }
      navigate("/blog");
    } catch (error: any) {
      console.error("Lỗi khi lưu bài viết:", error);
       const res = error.response?.data?.errors ?? [];

      const errMessage = Object.values(res)
        .map((item: any) => item.join(", "))
        .join(", ");

      toast.error(
        `Không thể ${action === "update" ? "cập nhật" : "tạo"} bài viết` +
          ": " +
          errMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadThumbnail = async (file: File) => {
    try {
      setLoading(true);
      const response = await BlogService.uploadImage(file);
      setLoading(false);
      setFormData({ ...formData, thumbnail: response });
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      toast.error("Không thể tải ảnh");
      return null;
    }
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        setLoading(true);
        BlogService.uploadImage(file)
          .then((response) => {
            if (response && quillRef.current) {
              const range = quillRef.current.getEditor().getSelection();
              quillRef.current
                .getEditor()
                .insertEmbed(range.index, "image", response);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Lỗi khi tải ảnh:", error);
            toast.error("Không thể tải ảnh");
          });
      }
    };
  }, []);

  return (
    <div className="card">
      {loading && <Loading />}
      <div className="card-header">
        <h3 className="card-title">
          {action === "view"
            ? "Xem"
            : action === "update"
              ? "Chỉnh sửa"
              : "Tạo"}{" "}
          Bài Viết
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body row">
          {/* Left Side */}
          <div className="col col-lg-8 col-sm-12 pb-3 mb-6">
            <div className="form-group">
              <label htmlFor="title">
                Tiêu đề <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                id="title"
                placeholder="Nhập tiêu đề bài viết"
                value={formData?.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                readOnly={action === "view"}
              />
              {errors.title && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {errors.title}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Nội dung <span className="text-danger">*</span>
              </label>
              <ReactQuill
                theme="snow"
                ref={quillRef}
                placeholder="Nhập nội dung bài viết"
                style={{ height: "500px" }}
                value={formData.content || ""}
                onChange={(content) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    content: content,
                  }));
                }}
                readOnly={action === "view"}
                modules={{
                  toolbar: {
                    container: [
                      [{ header: "1" }, { header: "2" }, { font: [] }],
                      [{ size: [] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                      ],
                      ["link", "image", "video"],
                      ["code-block"],
                      ["clean"],
                    ],
                    handlers: {
                      image: imageHandler,
                    },
                  },
                  clipboard: {
                    matchVisual: false,
                  },
                }}
                formats={[
                  "header",
                  "font",
                  "size",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "indent",
                  "link",
                  "image",
                  "video",
                  "code-block",
                ]}
              />
            </div>
          </div>
          {errors.content && (
              <div
                className="invalid-feedback"
                style={{ display: "block", transform: "translateY(30px)" }}
              >
                {errors.content}
              </div>
            )}

          {/* Right Side */}
          <div className="col col-lg-4 col-sm-12">
            <div className="form-group">
              <label style={{ display: "block" }}>
                Ảnh đại diện <span className="text-danger">*</span>
              </label>
              <label
                htmlFor="thumbnail"
                style={{
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                <img
                  src={formData.thumbnail?.toString() ?? NoImage}
                  alt="Preview"
                  style={{ maxHeight: "200px", borderRadius: "8px" }}
                />
                {errors.thumbnail && (
                  <div
                    className="invalid-feedback"
                    style={{
                      display: "block",
                      position: "absolute",
                      fontWeight: "normal",
                      top: "100%",
                    }}
                  >
                    {errors.thumbnail}
                  </div>
                )}
              </label>

              {action !== "view" && (
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  style={{ display: "none" }}
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadThumbnail(file);
                    }
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Danh mục <span className="text-danger">*</span>
              </label>
              <select
                className={`form-control ${errors.category_id ? "is-invalid" : ""}`}
                value={formData.category_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: Number(e.target.value),
                  })
                }
                disabled={action === "view"}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {errors.category_id}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="publish_date">
                Ngày xuất bản <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.publish_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, publish_date: e.target.value })
                }
                readOnly={action === "view"}
              />
              {errors.pushish_date && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {errors.pushish_date}
                </div>
              )}
            </div>

            <div className="form-group ml-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.is_featured || false}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                disabled={action === "view"}
              />
              <label htmlFor="is_featured">Bài viết nổi bật</label>
            </div>
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
            className="btn btn-secondary ml-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailBlog;
