import { useRef, useState, useEffect } from "react";

const categories = [
  {
    name: "Casual Wear",
    image: "https://storage.googleapis.com/a1aa/image/9es1lUY2UnVAZKh9aRfCY7hycBeenXOQ0Hh6cTgzWh46rnfgC.jpg",
  },
  {
    name: "Western Wear",
    image: "https://storage.googleapis.com/a1aa/image/vOaOujIR1pp4Fd9HzVGiBqYBP6f3Sd5pGfPVw7cGnB2y65HUA.jpg",
  },
  {
    name: "Ethnic Wear",
    image: "https://storage.googleapis.com/a1aa/image/QNCvVWfsqJzfZ0jvriCecffdfOVWJX2zfjmqGoZFARG8a98DKA.jpg",
  },
  {
    name: "Kids Wear",
    image: "https://storage.googleapis.com/a1aa/image/7rH4kdaS2TJdAVScntKasoBOEeYs4Hkf59C7wNIVyxxG75HUA.jpg",
  },
  {
    name: "Formal Wear",
    image: "https://storage.googleapis.com/a1aa/image/QNCvVWfsqJzfZ0jvriCecffdfOVWJX2zfjmqGoZFARG8a98DKA.jpg",
  },
];

export default function CategorySlider() {
  const sliderRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);
  const itemsPerView = 4;

  useEffect(() => {
    const updateItemWidth = () => {
      if (sliderRef.current && sliderRef.current.children.length > 0) {
        setItemWidth(sliderRef.current.children[0].offsetWidth);
      }
    };

    updateItemWidth();
    const observer = new ResizeObserver(updateItemWidth);
    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += itemWidth;
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= itemWidth;
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Shop by Categories</h2>
        <div className="relative">
          <button
            onClick={prevSlide}
            className="absolute top-[-50px] right-[50px] transform -translate-y-1/2 bg-white text-black hover:bg-black hover:text-white px-3 py-2 border rounded z-10"
          >
            ←
          </button>

          <div className="overflow-hidden" ref={sliderRef} style={{ scrollBehavior: "smooth", display: "flex" }}>
            {categories.map((category, index) => (
              <div key={index} className="relative w-1/4 flex-shrink-0 px-2">
                <img src={category.image} alt={category.name} className="w-full" />
                <button className="text-center w-[90%] absolute bottom-4 left-4 bg-white px-4 py-2 rounded">
                  {category.name}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="absolute top-[-50px] right-0 transform -translate-y-1/2 bg-white text-black hover:bg-black hover:text-white px-3 py-2 border rounded z-10"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
