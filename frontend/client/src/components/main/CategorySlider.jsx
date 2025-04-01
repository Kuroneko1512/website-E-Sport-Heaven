import React from 'react';

const categories = [
  { name: 'Danh mục 1' },
  { name: 'Danh mục 2' },
  { name: 'Danh mục 3' },
  { name: 'Danh mục 4' },
  { name: 'Danh mục 5' },
  { name: 'Danh mục 6' },
  { name: 'Danh mục 7' },
  { name: 'Danh mục 8' },
];

const CategorySlider = () => {
  return (

    <div className="container mx-auto p-4">
      {/* Sử dụng grid: sm: 2 cột, md: 3 cột, lg: 4 cột */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white shadow rounded p-4 flex flex-col items-center justify-center transform transition-transform duration-300 hover:scale-105"

          >
            {/* Comment phần hình ảnh để tiện thêm khi có hình */}
            {/*
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-32 object-cover mb-2"
            />
            */}
            <span className="text-lg font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;