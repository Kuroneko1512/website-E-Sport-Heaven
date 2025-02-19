import React from "react";

const fakeData = [
  {
    id: 1,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
  {
    id: 2,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
  {
    id: 3,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },{
    id: 4,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },
];

const ProductBestseller = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center inline-block">
        Our Best Sellers
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {fakeData.map((item)=> (
        <div className="card bg-white hover:shadow-xl w-64 h-110 relative overflow-hidden" key={item.id}>
        <div className="relative h-80">
          <img
            alt={item.name}
            className="w-full h-full object-cover"
            height="330"
            src={item.image}
            width="300"
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
          <h2 className="text-lg font-bold">{item.brand}</h2>
          <p className="text-gray-600">{item.name}</p>
          <div className="flex items-center mt-2">
            <span className="text-lg font-bold"> ${item.price} </span>
            <span className="text-gray-400 line-through ml-2"> ${item.oldPrice} </span>
          </div>
        </div>
      </div>
      ))}
      </div>
    </div>
  );
};

export default ProductBestseller;
