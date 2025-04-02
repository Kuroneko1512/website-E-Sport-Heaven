import { useState ,useEffect} from "react";
import { FormComponent } from "../Attribute/FormComponent";
import TableComponent from "../Attribute/TableComponent";
import {
  getAttributes,
  Attribute,
  Pagination,
} from "@app/services/Attribute/ApiAttribute";
import { AttributeValueFormComponent } from "./AttributeValue";

const AttributePage = () => {
  // State lưu thuộc tính đang chỉnh sửa
  const [editingAttribute, setEditingAttribute] = useState<{ id: number; name: string; description: string } | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,  
    total: 0,
    per_page: 5,
    data: [],
  });
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null); // 🔥 Khi chọn thuộc tính
  const fetchData = async (page = 1) => {
    try {
      const response = await getAttributes(page, pagination.per_page);
      setAttributes(response.data.data);
      setPagination(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          {/* Left column */}
          <div className="col-md-4">
            {/* Form thêm/sửa */}
            <FormComponent 
              onFormSubmit={() => {
                // Sau khi thêm/sửa, reset editingAttribute
                setEditingAttribute(null);
              }} 
              refreshAttributes={fetchData}
              editingAttribute={editingAttribute}
              setEditingAttribute={setEditingAttribute}
            />
              {/* Hiển thị Form quản lý giá trị thuộc tính khi đã chọn thuộc tính */}
           
          </div>
          {/* Right column */}
          <div className="col-md-8">
            {/* Bảng danh sách thuộc tính */}
            <TableComponent  onSelectAttribute={setSelectedAttributeId} attributes={attributes} pagination={pagination} refreshAttributes={fetchData} setEditingAttribute={setEditingAttribute} />
          </div>
        </div>
        {selectedAttributeId && (
              <AttributeValueFormComponent
              attributeId={selectedAttributeId}
              setSelectedAttributeId={setSelectedAttributeId}
              />
            )}
      </div>
    </section>
  );
};

export default AttributePage;
