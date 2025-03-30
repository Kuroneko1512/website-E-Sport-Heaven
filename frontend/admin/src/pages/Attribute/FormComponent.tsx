import { useState, useEffect } from "react";
import { createAttribute, updateAttribute } from "../../services/Attribute/ApiAttribute";
import { toast } from "react-toastify";

interface FormComponentProps {
  editingAttribute?: { id: number; name: string; description: string } | null;
  onFormSubmit: () => void; // Hàm callback khi hoàn thành thêm/sửa
  setEditingAttribute: (attribute: null) => void; // Để reset khi cập nhật xong
  refreshAttributes: (page?: number) => void;
}

export const FormComponent = ({ editingAttribute, onFormSubmit, setEditingAttribute , refreshAttributes}: FormComponentProps) => {
  const [attribute, setAttribute] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Cập nhật state khi editingAttribute thay đổi
  useEffect(() => {
    if (editingAttribute) {
      setAttribute({
        name: editingAttribute.name,
        description: editingAttribute.description,
      });
    } else {
      setAttribute({ name: "", description: "" });
    }
  }, [editingAttribute]);

  const validate = () => {
    let newErrors: { name?: string; description?: string } = {};

    if (!attribute.name.trim()) {
      newErrors.name = "Tên thuộc tính không được để trống";
    } else if (attribute.name.length > 255) {
      newErrors.name = "Tên không được vượt quá 255 ký tự";
    }

    if (attribute.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Hàm thay đổi state
  const handleChange = (key: keyof typeof attribute, value: string) => {
    setAttribute((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang
if (!validate()) return;
    try {
      if (editingAttribute) {
        // Nếu đang chỉnh sửa -> gọi API cập nhật
        await updateAttribute(editingAttribute.id, attribute);
        toast.success("Cập nhật thành công!");
        setEditingAttribute(null); // Xóa trạng thái chỉnh sửa
      } else {
        // Nếu không có editingAttribute -> gọi API tạo mới
        await createAttribute(attribute);
       toast.success("Thêm thành công!");
      }
      refreshAttributes();
      // Reset form sau khi gửi thành công
      setAttribute({ name: "", description: "" });
      onFormSubmit(); // Gọi callback để cập nhật danh sách
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        console.log(error.response.data);
        const errorMessage = error.response.data.errors.name[0];
        toast.error(`Lỗi: ${errorMessage}`); // Hiển thị lỗi từ API
      } else {
        console.error("Lỗi khi gửi dữ liệu:", error);
        toast.error("Có lỗi xảy ra khi gửi dữ liệu!");
      }
    }
  };

  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">{editingAttribute ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính"}</h3>
      </div>
      {/* Form start */}
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label>Tên</label>
            <input
               className={`form-control ${errors.name ? "is-invalid" : ""}`}
              type="text"
              placeholder="Nhập tên"
              value={attribute.name}
              onChange={(e) => handleChange("name", e.target.value)}
             
            />
               {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <input
              type="text"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              placeholder="Nhập mô tả"
              value={attribute.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
             {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </div>
        {/* Form footer */}
        <div className="card-footer">
          <button type="submit" className="btn btn-primary">
            {editingAttribute ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingAttribute && (
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => setEditingAttribute(null)}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
