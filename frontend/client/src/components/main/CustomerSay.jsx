import React, { useState } from "react";

const testimonials = [
  { name: "Leslie Alexander", role: "Model", img: "https://placehold.co/40x40", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", rating: 5 },
  { name: "Jacob Jones", role: "Co-Founder", img: "https://placehold.co/40x40", text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", rating: 4 },
  { name: "Jenny Wilson", role: "Fashion Designer", img: "https://placehold.co/40x40", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.", rating: 3 },
  { name: "Cameron Williamson", role: "Entrepreneur", img: "https://placehold.co/40x40", text: "Duis aute irure dolor in reprehenderit in voluptate velit esse.", rating: 5 },
  { name: "Kristin Watson", role: "CEO", img: "https://placehold.co/40x40", text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa.", rating: 4 },
  { name: "Ralph Edwards", role: "Investor", img: "https://placehold.co/40x40", text: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt.", rating: 2 }
];

const CustomerSay = () => {
  const [startIndex, setStartIndex] = useState(0);

  const nextTestimonial = () => {
    setStartIndex((startIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setStartIndex((startIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left">What our Customer say's</h2>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button onClick={prevTestimonial} className=" bg-white text-black hover:bg-black hover:text-white px-3 py-2 border rounded-lg shadow-md z-10 hidden md:block">
          ←
          </button>
          <button onClick={nextTestimonial} className=" bg-white text-black hover:bg-black hover:text-white px-3 py-2 border rounded-lg shadow-md z-10 hidden md:block">
          →
          </button>
        </div>
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        {Array.from({ length: window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3 }).map((_, i) => {
          const index = (startIndex + i) % testimonials.length;
          const t = testimonials[index];
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg max-w-xs sm:max-w-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[...Array(t.rating)].map((_, starIndex) => (
                    <i key={starIndex} className="fas fa-star"></i>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{t.text}</p>
              <div className="flex items-center">
                <img className="w-10 h-10 rounded-full mr-4" src={t.img} alt={t.name} />
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerSay;
