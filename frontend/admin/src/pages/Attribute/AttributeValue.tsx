import { useState, useEffect } from "react";
import { AttributeValueService, Pagination } from "../../services/Attribute/ApiAttributeValue";
import { toast } from "react-toastify";

interface FormComponentProps {
  attributeId: number;
  setSelectedAttributeId: (id: number | null) => void;
}

export const AttributeValueFormComponent = ({ attributeId ,setSelectedAttributeId }: FormComponentProps) => {
  const [editingAttributeValue, setEditingAttributeValue] = useState<{ id: number; value: string; description: string } | null>(null);
  const [attributeValue, setAttributeValue] = useState({ value: "", description: "" });
  const [errors, setErrors] = useState<{ value?: string; description?: string }>({});
  const [attributeValues, setAttributeValues] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 5,
    data: [],
  });

  useEffect(() => {
    fetchAttributeValues();
  },[] );

  const fetchAttributeValues = async (page = 1) => {
    try {
      const response = await AttributeValueService.getAll(attributeId, page, pagination.per_page);
      setAttributeValues(response.data.data.data);
      setPagination(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    }
  };

  const validate = () => {
    let newErrors: { value?: string; description?: string } = {};

    if (!attributeValue.value.trim()) {
      newErrors.value = "Giá trị không được để trống";
    } else if (attributeValue.value.length > 255) {
      newErrors.value = "Giá trị không được vượt quá 255 ký tự";
    }

    if (attributeValue.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: keyof typeof attributeValue, value: string) => {
    setAttributeValue((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (editingAttributeValue) {
        await AttributeValueService.update(editingAttributeValue.id, { ...attributeValue, attribute_id: attributeId });

        toast.success("Cập nhật thành công!");
        setIsSubmitting(false);
      } else {
        await AttributeValueService.create({ ...attributeValue, attribute_id: attributeId });

        toast.success("Thêm thành công!");
        setIsSubmitting(false);
      }
      fetchAttributeValues();
      setAttributeValue({ value: "", description: "" });
      setEditingAttributeValue(null); 
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.log(error.response.data);
        toast.error(`Lỗi: ${error.response.data.errors.name[0]}`);
      } else {
        console.error("Lỗi khi gửi dữ liệu:", error);
        toast.error("Có lỗi xảy ra khi gửi dữ liệu!");
      }
    }
  };

  const handleEdit = (attribute: any) => {
    setEditingAttributeValue(attribute);
    setAttributeValue({ value: attribute.value, description: attribute.description });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await AttributeValueService.delete(id);
      toast.success("Xóa thành công!");
      fetchAttributeValues();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    }
  };

  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">{editingAttributeValue ? "Chỉnh sửa giá trị" : "Thêm giá trị"}</h3>
        <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse" title="Collapse" onClick={() => setSelectedAttributeId(null)}>
                            <i className="fas fa-minus"></i>
                        </button>
                     
                    </div>
      </div>
      <div className="card-body">
      <form onSubmit={handleSubmit}>
  <div className="form-group">
    <label>Giá trị</label>
    <input
      className={`form-control ${errors.value ? "is-invalid" : ""}`}
      type="text"
      placeholder="Nhập giá trị"
      value={attributeValue.value}
      onChange={(e) => handleChange("value", e.target.value)}
    />
    {errors.value && <div className="invalid-feedback">{errors.value}</div>}
  </div>
  <div className="form-group">
    <label>Mô tả</label>
    <input
      type="text"
      className={`form-control ${errors.description ? "is-invalid" : ""}`}
      placeholder="Nhập mô tả"
      value={attributeValue.description}
      onChange={(e) => handleChange("description", e.target.value)}
    />
    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
  </div>
  <div className="d-flex gap-2">
    <button type="submit" className="btn btn-primary">
      {editingAttributeValue ? "Cập nhật" : "Thêm mới"}
    </button>
    {editingAttributeValue && (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setEditingAttributeValue(null);
          setAttributeValue({ value: "", description: "" });
        }}
      >
        Hủy
      </button>
    )}
  </div>
</form>

        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {attributeValues.map((attrValue) => (
              <tr key={attrValue.id}>
                <td>{attrValue.id}</td>
                <td>{attrValue.value}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => handleEdit(attrValue)}>Sửa</button>
                  <button className="btn btn-danger btn-sm ml-2" onClick={() => handleDelete(attrValue.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phân trang */}
      <div className="card-footer clearfix">
        <ul className="pagination pagination-sm m-0 float-right">
          <li className={`page-item ${!pagination.prev_page_url && "disabled"}`}>
            <button className="page-link" onClick={() => fetchAttributeValues(pagination.current_page - 1)} disabled={!pagination.prev_page_url}>Trước</button>
          </li>
          {[...Array(pagination.last_page)].map((_, i) => (
            <li key={i} className={`page-item ${pagination.current_page === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => fetchAttributeValues(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${!pagination.next_page_url && "disabled"}`}>
            <button className="page-link" onClick={() => fetchAttributeValues(pagination.current_page + 1)} disabled={!pagination.next_page_url}>Tiếp</button>
          </li>
        </ul>
      </div>
    </div>
  );
};
