import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import NoImage from "../../../public/img/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.avif";
import { Link, Outlet } from "react-router-dom";
const Store = () => {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
 

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container-fluid bg-white p-4">
      <h3>ADD PRODUCT</h3>
      <form>
        <div className="row align-items-stretch">
          {/* Cột nhập thông tin sản phẩm */}
          <div className="col-8 bg-body-secondary p-3">
            <input
              type="text"
              className="w-100 form-control my-2"
              placeholder="Name"
              name="name"
            />
            <ReactQuill
              theme="snow"
              value={value}
              style={{ height: "300px", marginBottom: "20px" }}
              onChange={setValue}
            />
            <div className="Choose mt-5">
              <h3>Choose Product</h3>
            </div>

            {/* Chọn sản phẩm */}
            <div className="row align-items-stretch my-3">
              <div className="col-3 p-3 bg-light border rounded">
                <ul>
                  <li>
                    <Link to="AttributeForm">Attribute</Link>
                  </li>
                  <li>
               
                    <Link to="Description">Description</Link>
                  </li>
                </ul>
              </div>
              <div className="col-9 p-3 bg-light border">
                <Outlet />
              </div>
            </div>
          </div>

          {/* Cột upload ảnh & chọn danh mục */}
          <div className="col-4 p-3">
            <img
              src={image || NoImage}
              alt="Preview"
              className="mx-4 mt-2"
              style={{ maxHeight: "200px", borderRadius: "8px" }}
            />
            <input
              type="file"
              className="form-control my-3"
              onChange={handleImageChange}
              accept="image/*"
            />
            <select name="categories" className="form-control mt-2">
              <option value="">Category</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Store;
