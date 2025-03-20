import React from "react";
import Banner1 from "../../assets/banner.jpg";
import Banner2 from "../../assets/Banner2.png";
import Banner3 from "../../assets/Banner3.png";
import Banner4 from "../../assets/Banner4.png";
import Banner5 from "../../assets/Banner5.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const images = [Banner1, Banner2, Banner3, Banner4, Banner5];

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: true, // ✅ Bật chế độ tự chuyển ảnh
    autoplaySpeed: 3000, // ⏳ Thời gian mỗi slide (3000ms = 3 giây)
  };

  return (
    <Slider {...settings} className="mx-auto">
      {images.map((src, index) => (
        <div key={index} className="flex justify-center">
          <img
            src={src}
            alt={`slide-${index}`}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover mx-auto"
          />
        </div>
      ))}
    </Slider>
  );
};

export default Banner;
