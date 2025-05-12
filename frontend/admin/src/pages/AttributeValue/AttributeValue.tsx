import { useState, useEffect } from "react";
import CategoryForm from "../Category/FormComponent";
import TableComponent from "../Category/TableComponent";
import { CategoryService, Category,Pagination } from "@app/services/Category/CategoryApi";

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0,
    per_page: 5,
    data: [],
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
 
  const fetchCategories = async (page = 1) => {
    try {
      const response  = await CategoryService.getAll(page, pagination.per_page);
      setCategories(response.data.data); 
      setPagination(response.data); 
    
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
        <div className="col-md-4">
            <CategoryForm  onCategoryAdded={fetchCategories} editingCategory={editingCategory} setEditingCategory={setEditingCategory} />
          </div>
          <div className="col-md-8">
            <TableComponent categories={categories} pagination={pagination} refreshCategories={fetchCategories} setEditingCategory={setEditingCategory} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
