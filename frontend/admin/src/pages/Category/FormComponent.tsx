import { useState, useEffect } from "react";
import { CategoryService, Category } from "@app/services/Category/CategoryApi";

interface CategoryFormProps {
  categories: Category[];
  onCategoryAdded: () => void;
  editingCategory?: Category | null;
  setEditingCategory: (category: Category | null) => void;
}

const CategoryForm = ({ categories, onCategoryAdded, editingCategory, setEditingCategory }: CategoryFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description);
      setParentId(editingCategory.parent_id || null);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
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
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Danh mục cha</label>
            <select className="form-control" value={parentId ?? ""} onChange={(e) => setParentId(Number(e.target.value) || null)}>
              <option value="">Không có</option>
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id) // Không cho chọn chính nó
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
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
