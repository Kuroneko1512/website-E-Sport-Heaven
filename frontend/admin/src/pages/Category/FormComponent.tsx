import { useState, useEffect } from "react";
import { CategoryService, Category } from "@app/services/Category/CategoryApi";
import { toast } from "react-toastify";

interface CategoryFormProps {

  onCategoryAdded: () => void;
  editingCategory?: Category | null;
  setEditingCategory: (category: Category | null) => void;
}

const CategoryForm = ({  onCategoryAdded, editingCategory, setEditingCategory }: CategoryFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]);

  
  // Hàm fetch dữ liệu danh mục
  const fetchCategories = async (page = 1) => {
    try {
      const response  = await CategoryService.getAllNoPagination();
      // setCategories(response.data as Category); // Giả sử API trả về `data.data` là danh sách category
      setCategories(response.data.data); 
      console.log('data:',categories);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

 
  useEffect(() => {
    fetchCategories();
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description);
      setParentId(editingCategory.parent_id || null);
    }
  }, [editingCategory]);
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
  
    if (!name.trim()) {
      newErrors.name = "Tên danh mục không được để trống.";
    } else if (name.length > 255) {
      newErrors.name = "Tên danh mục không được vượt quá 255 ký tự.";
    }
  
    if (description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự.";
    }
  
    if (parentId !== null && categories.every(cat => cat.id !== parentId)) {
      newErrors.parent_id = "Danh mục cha không hợp lệ.";
    }
  
    if (editingCategory && editingCategory.id === parentId) {
      newErrors.parent_id = "Danh mục không thể là cha của chính nó.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(errors);
    if (!validateForm()) return;
    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id, { name, description, parent_id: parentId });
        alert("Cập nhật danh mục thành công!");
        setEditingCategory(null);
      } else {
        await CategoryService.create({ name, description, parent_id: parentId });
        alert("Thêm danh mục thành công!");
      }
      setName("");
      setDescription("");
      setParentId(null);
      onCategoryAdded();
    } 
      catch (error: any) {
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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên danh mục</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
        
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              
            />
             {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          <div className="form-group">
            <label>Danh mục cha</label>
            <select  className={`form-control ${errors.parent_id ? "is-invalid" : ""}`} value={parentId ?? ""} onChange={(e) => setParentId(Number(e.target.value) || null)}>
              <option value="">Không có</option>
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id) // Không cho chọn chính nó
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            {errors.parent_id && <div className="invalid-feedback">{errors.parent_id}</div>}
          </div>
          <button type="submit" className="btn btn-primary">
            {editingCategory ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingCategory && (
            <button type="button" className="btn btn-secondary ml-2" onClick={() => setEditingCategory(null)}>
              Hủy
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
