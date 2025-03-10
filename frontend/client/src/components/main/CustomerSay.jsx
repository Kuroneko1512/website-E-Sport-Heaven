import React, { useRef } from "react"; 

const testimonials = [
  { name: "Leslie Alexander", role: "Model", img: "https://placehold.co/40x40", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", rating: 5 },
  { name: "Jacob Jones", role: "Co-Founder", img: "https://placehold.co/40x40", text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", rating: 4 },
  { name: "Jenny Wilson", role: "Fashion Designer", img: "https://placehold.co/40x40", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.", rating: 3 },
  { name: "Cameron Williamson", role: "Entrepreneur", img: "https://placehold.co/40x40", text: "Duis aute irure dolor in reprehenderit in voluptate velit esse.", rating: 5 },
  { name: "Kristin Watson", role: "CEO", img: "https://placehold.co/40x40", text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa.", rating: 4 },
  { name: "Ralph Edwards", role: "Investor", img: "https://placehold.co/40x40", text: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt.", rating: 2 }
];

const CustomerSay = () => {
  const sliderRef = useRef(null);
  
  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += sliderRef.current.offsetWidth / 2;
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= sliderRef.current.offsetWidth / 2;
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left text-gray-900 dark:text-gray-100">
          What our Customers Say
        </h2>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button 
            onClick={prevSlide} 
            className="bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-black dark:hover:bg-gray-600 hover:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md z-10"
          >
            ←
          </button>
          <button 
            onClick={nextSlide} 
            className="bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-black dark:hover:bg-gray-600 hover:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md z-10"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={sliderRef} 
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory p-4">
          {testimonials.map((item, index) => (
            <div key={index} className="relative flex-shrink-0 w-3/4 sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3 snap-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:shadow-gray-700 transition-transform transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[...Array(item.rating)].map((_, starIndex) => (
                    <i key={starIndex} className="fas fa-star"></i>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{item.text}</p>
              <div className="flex items-center">
                <img className="w-10 h-10 rounded-full mr-4" src={item.img} alt={item.name} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerSay;
