import { Link } from 'react-router-dom';

const Product = () => {
  return (
    // cho rộng full màn hình và căn  giữa màu nên xám
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 ">
   
  
    <div className="w-full max-w-5xl overflow-x-auto bg-white shadow-lg rounded-lg p-5">
      <h1 className=" text-3xl font-bold mb-5 text-center">Trang Sản Phẩm</h1>
    {/* link dẫn tới trang thêm sản phẩm */}
      
       <Link to="/add-product" className="btn btn-success mb-4">
                   + Add
                  </Link>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="border border-gray-300 px-4 py-2">Song</th>
            <th className="border border-gray-300 px-4 py-2">Artist</th>
            <th className="border border-gray-300 px-4 py-2">Year</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">The Sliding Mr. Bones (Next Stop, Pottersville)</td>
            <td className="border border-gray-300 px-4 py-2">Malcolm Lockyer</td>
            <td className="border border-gray-300 px-4 py-2">1961</td>
          </tr>
          <tr className="hover:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">Witchy Woman</td>
            <td className="border border-gray-300 px-4 py-2">The Eagles</td>
            <td className="border border-gray-300 px-4 py-2">1972</td>
          </tr>
          <tr className="hover:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">Shining Star</td>
            <td className="border border-gray-300 px-4 py-2">Earth, Wind, and Fire</td>
            <td className="border border-gray-300 px-4 py-2">1975</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  );
};

export default Product;
