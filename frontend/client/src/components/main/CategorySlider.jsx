import { useRef } from "react";  

const categories = [
  { name: "Casual Wear", image: "https://storage.googleapis.com/a1aa/image/9es1lUY2UnVAZKh9aRfCY7hycBeenXOQ0Hh6cTgzWh46rnfgC.jpg" },
  { name: "Western Wear", image: "https://storage.googleapis.com/a1aa/image/vOaOujIR1pp4Fd9HzVGiBqYBP6f3Sd5pGfPVw7cGnB2y65HUA.jpg" },
  { name: "Ethnic Wear", image: "https://storage.googleapis.com/a1aa/image/QNCvVWfsqJzfZ0jvriCecffdfOVWJX2zfjmqGoZFARG8a98DKA.jpg" },
  { name: "Kids Wear", image: "https://storage.googleapis.com/a1aa/image/7rH4kdaS2TJdAVScntKasoBOEeYs4Hkf59C7wNIVyxxG75HUA.jpg" },
  { name: "Formal Wear", image: "https://storage.googleapis.com/a1aa/image/QNCvVWfsqJzfZ0jvriCecffdfOVWJX2zfjmqGoZFARG8a98DKA.jpg" },
];

const CategorySlider = () => {
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
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Shop by Categories</h2>
        <div className="relative">
          {/* Nút Previous */}
          <button
            onClick={prevSlide}
            className="absolute top-[-50px] right-[50px] transform -translate-y-1/2 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-gray-600 hover:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md z-10 hidden md:block"
          >
            ←
          </button>

          {/* Slider */}
          <div 
            ref={sliderRef} 
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
          >
            {categories.map((category, index) => (
              <div key={index} className="relative flex-shrink-0 w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 snap-center">
                <img src={category.image} alt={category.name} className="w-full h-[250px] object-cover rounded-lg" />
                <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">
                  {category.name}
                </button>
              </div>
            ))}
          </div>

          {/* Nút Next */}
          <button
            onClick={nextSlide}
            className="absolute top-[-50px] right-0 transform -translate-y-1/2 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-gray-600 hover:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md z-10 hidden md:block"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
