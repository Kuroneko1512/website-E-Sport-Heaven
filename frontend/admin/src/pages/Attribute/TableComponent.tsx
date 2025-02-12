import { useState, useEffect } from "react";
import { getAttributes } from "@app/services/Attribute/Api";
import { log } from "node:console";

const TableComponent = () => {
  // State lưu danh sách attributes
  const [attributes, setAttributes] = useState<
    { id: number; name: string; description: string }[]
  >([]);

  // Gọi API lấy danh sách attributes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAttributes(); // Gọi API
        setAttributes(data.data.data);
        // Lưu vào state
        console.log(data.data.data);
        
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);


    return (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Attribute</h3>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ width: "10px" }}>Id</th>
                  <th>Name</th>
                  <th>Description</th>
                 
                </tr>
              </thead>
              <tbody>
            {attributes.map((attr) => (
              <tr key={attr.id}>
                <td>{attr.id}</td>
                <td>{attr.name}</td>
                <td>{attr.description}</td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
          <div className="card-footer clearfix">
            <ul className="pagination pagination-sm m-0 float-right">
              <li className="page-item"><a className="page-link" href="#">«</a></li>
              <li className="page-item"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item"><a className="page-link" href="#">»</a></li>
            </ul>
          </div>
        </div>
      );
}

export default TableComponent;