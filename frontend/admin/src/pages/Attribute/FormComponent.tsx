import { useState } from "react";
import {createAttribute} from '../../services/Attribute/ApiAttribute';
export const FormComponent = () => {
  const [attribute, setAttribute] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  // Hàm thay đổi state
  const handleChange = (key: keyof typeof attribute, value: string) => {
    setAttribute((prev) => ({
      ...prev,
      [key]: value,
    }));


  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang
    const formData = new FormData();
    formData.append("name", attribute.name);
    formData.append("description", attribute.description);
    try {
      const response = await createAttribute(formData);
      console.log("Dữ liệu đã gửi:", response.data);
      alert("Thêm thành công!");

      // Reset form sau khi gửi thành công
      setAttribute({ name: "", description: "" });
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      alert("Có lỗi xảy ra khi gửi dữ liệu!");
    }
  };
  return (
    <div className="card card-primary">
      <div className="card-header">
        <h3 className="card-title">Quick Example</h3>
      </div>
      {/* Form start */}
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Name</label>
            <input
              className="form-control"
              type="text"
              placeholder="Nhập tên"
              value={attribute.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exampleInputPassword1">Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập mô tả"
              value={attribute.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>
        {/* Form footer */}
        <div className="card-footer">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

//  FormComponent;
