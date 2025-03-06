



  const Store = () => {
   
 
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-5">
        <div className=" w-75 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Thêm Sản Phẩm</h2>
  
          <form  className="space-y-4">
            <input
              type="text"
              name="name"
              
              
              placeholder="Tên sản phẩm"
              className="w-full p-2 border rounded"
              required
            />
  
            <input
              type="text"
              name="code"
            
            
              placeholder="Mã sản phẩm"
              className="w-full p-2 border rounded"
              required
            />
  
            <input
              type="number"
              name="quantity"
             
             
              placeholder="Số lượng"
              className="w-full p-2 border rounded"
              required
            />
  
            <input
              type="number"
              name="price"
              
             
              placeholder="Giá"
              className="w-full p-2 border rounded"
              required
            />
  
            <input
              type="file"
              name="main_image"
             
              placeholder="Ảnh đại diện (Mặc định: 0)"
              className="w-full p-2 border rounded"
            />
  
            <input
              type="file"
              name="sub_image"
           
           
              placeholder="Ảnh phụ )"
              className="w-full p-2 border rounded"
            />
  
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Thêm Sản Phẩm
            </button>
          </form>
        </div>
      </div>
    );
  };
export default Store ;

