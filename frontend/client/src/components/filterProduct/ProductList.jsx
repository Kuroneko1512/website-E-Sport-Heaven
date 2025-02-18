import React from "react";
const ProductList = ({ products }) => {
  // console.log("products", products);
  return (
    <div className='grid grid-cols-1 p-5 md:grid-cols-2 xl:grid-cols-3 gap-4 '>
      {/* Thử giao diện */}
      {products.map((item)=> (
        <div className="card bg-white hover:shadow-xl w-64 h-110 relative overflow-hidden" key={item.id}>
        <div className="relative h-80">
          <img
            alt={item.name}
            className="w-full h-full object-cover"
            src={item.image}
          />
          <div
            className="overlay absolute inset-0 bg-opacity-50 flex flex-col justify-center items-center opacity-0 transition-opacity duration-300"
          >
            <button className="text-white mb-4">
             
              <i className="far fa-heart absolute text-black top-5 right-5 border rounded-full border-[#D9D9D9] p-3 bg-[#D9D9D9] hover:bg-white"> </i>
            </button>
            <button className="bg-black text-white py-2 px-4 rounded-lg absolute bottom-2 w-5/6 hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold">Roadstar</h2>
          <p className="text-gray-600">{item.name}</p>
          <div className="flex items-center mt-2">
            <span className="text-lg font-bold"> ${item.price} </span>
            <span className="text-gray-400 line-through ml-2"> ${item.originalPrice} </span>
          </div>
        </div>
      </div>
      ))}
    </div>
  );
};

export default ProductList;
