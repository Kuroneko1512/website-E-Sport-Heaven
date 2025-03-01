import { useState, useEffect } from "react";
import { useParams,useNavigate  } from "react-router-dom";
import { getAttributeById, updateAttribute } from "@app/services/Attribute/ApiAttribute";

const EditComponent = () => {
    const { id } = useParams<{ id: string }>(); // Lấy id từ URL

    const navigate = useNavigate();
    const [attribute, setAttribute] = useState<{ name: string; description: string } | null>(null);
    const [loading, setLoading] = useState(true);

 
    
    // Gọi API để lấy dữ liệu khi component render
    useEffect(() => {
       
        
        const fetchData = async () => {

            if(id ==  null ){
                navigate("/Attribute");
                return;
            }
            try {
                const response = await getAttributeById(id); // Gọi API
                setAttribute(response.data.data);
               
                
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
            setLoading(false);
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // Xử lý cập nhật dữ liệu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attribute) return;

        try {
            await updateAttribute(Number(id), attribute);
            alert("Cập nhật thành công!");
            navigate('/Attribute');
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (!attribute) return <p>Không tìm thấy dữ liệu!</p>;

    return (
                   
        
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Chỉnh sửa Thuộc tính</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="card-body">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={attribute.name}
                            onChange={(e) => setAttribute({ ...attribute, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            className="form-control"
                            value={attribute.description}
                            onChange={(e) => setAttribute({ ...attribute, description: e.target.value })}
                        />
                    </div>
                </div>
                <div className="card-footer">
                    <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                </div>
            </form>
        </div>
    );
};

export default EditComponent;
