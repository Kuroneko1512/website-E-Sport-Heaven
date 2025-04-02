import React from 'react'; 

const TopFooter = () => {
  return (
    <div className="bg-white dark:bg-gray-800 py-10">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { icon: "fas fa-box", title: "Miễn phí vận chuyển", desc: "Cho các đơn hàng hơn 200.000VNĐ" },
          { icon: "fas fa-dollar-sign", title: "Đảm bảo hoàn tiền", desc: "Chính sách đổi/trả trong 15 ngày" },
          { icon: "fas fa-headset", title: "Hỗ trợ trực tuyến", desc: "Hỗ trợ khách hàng 24/7" },
          { icon: "fas fa-credit-card", title: "Thanh toán linh hoạt", desc: "Nhiều phương thức thanh toán" },
        ].map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center p-4 text-gray-900 dark:text-gray-100 hover:text-black hover:dark:text-white transition"
          >
            <i className={`${item.icon} fa-2x mb-2`}></i>
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 hover:text-gray-700 hover:dark:text-gray-300">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopFooter;