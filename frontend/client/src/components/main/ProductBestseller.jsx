import React from "react";
import { Link } from "react-router-dom";

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
  },
  {
    id: 4,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },{
    id: 5,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },{
    id: 6,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },{
    id: 7,
    name: "Printed Cotton T-Shirt",
    brand: "Roadstar",
    price: 38,
    oldPrice: 50,
    image:
      "https://storage.googleapis.com/a1aa/image/MSTn7yA3fyZFHAGlWXBk7nhwiz0apOyrlCgC-ufECbM.jpg",
  },{
    id: 8,
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
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Our Best Sellers</h2>
      
      {/* Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fakeData.map((item) => (
          <div
          key={item.id}
          className="group bg-white shadow-md h-max rounded-lg overflow-hidden hover:shadow-xl duration-300 transition-transform transform hover:scale-105"
        >
          {/* Image section */}
          <div className="relative h-3/4">
            <img
              alt={item.name}
              className="w-full h-full object-cover"
              src={item.image}
            />
            
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <i className="far fa-heart absolute text-black top-5 right-5 border rounded-full border-[#D9D9D9] p-3 bg-[#D9D9D9] hover:bg-white"> </i>
              <button className="bg-black text-white py-2 px-4 rounded-lg mt-auto w-5/6 hover:bg-gray-800">
                Add to Cart
              </button>
            </div>
          </div>

          {/* Text section */}
        <Link to={`/product-detail/${item.id}`}>
          <div className="p-4">
            <h2 className="text-lg font-bold">{item.brand}</h2>
            <p className="text-gray-600">{item.name}</p>
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-black">
                ${item.price}
              </span>
              <span className="text-gray-400 line-through ml-2">
                ${item.oldPrice}
              </span>
            </div>
          </div>
        </Link>
        </div>
        ))}
      </div>
    </div>
  );
};

export default ProductBestseller;
