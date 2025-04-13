import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation để xử lý URL

const ThankYou = () => {
    const [orderCode, setOrderCode] = useState("");
    const location = useLocation(); // Lấy thông tin URL hiện tại

    useEffect(() => {
        // Truy xuất query param "orderCode" từ URL
        const queryParams = new URLSearchParams(location.search);
        const orderCodeFromURL = queryParams.get("orderCode"); // Lấy mã đơn hàng từ URL

        if (orderCodeFromURL) {
            setOrderCode(orderCodeFromURL);
            let checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
            let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Lọc các item trong cartItems, giữ lại những item không trùng với checkoutItems
            cartItems = cartItems.filter(item => !checkoutItems.some(checkoutItem => checkoutItem.id === item.id));
            
            // Cập nhật lại localStorage sau khi đã loại bỏ các item trùng
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } else {
            // Nếu không tìm thấy trên URL, kiểm tra trong localStorage
            const storedOrderCode = localStorage.getItem("orderCode");
            if (storedOrderCode) {
                setOrderCode(storedOrderCode);
                localStorage.removeItem("orderCode"); // Xóa sau khi sử dụng
            }
        }
    }, [location.search]);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
      {/* Container có hiệu ứng fade in (cần định nghĩa trong tailwind.config.js hoặc sử dụng plugin animate.css) */}
      <div className="text-center p-10 rounded-lg bg-white shadow-md max-w-md w-11/12 animate-fadeIn">
        {/* Hình ảnh có hiệu ứng bounce */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/5290/5290058.png"
          alt="Success"
          className="w-28 mb-5 mx-auto animate-bounce"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-fadeIn">
          🎉 Cảm ơn bạn đã đặt hàng! 🎉
        </h1>
        <p className="text-base text-gray-600 mb-5 animate-fadeIn">
          Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ sớm liên hệ với bạn.
        </p>

        {orderCode && (
          // Hiệu ứng pulse cho thông tin mã đơn hàng
          <div className="bg-green-100 p-3 rounded inline-block mb-5 ">
            <h2 className="text-xl text-gray-800">
              <span className="mr-1 text-xl text-green-600">✅</span>
              Mã đơn hàng của bạn:{" "}
              <strong className="font-bold text-blue-600 ml-1">
                {orderCode}
              </strong>
            </h2>
          </div>
        )}

        {/* Nút có hiệu ứng hover thay đổi màu sắc */}
        <Link
          to="/"
          className="inline-block px-4 py-3 text-lg text-white bg-blue-600 no-underline rounded font-bold transition duration-300 hover:bg-blue-700 animate-fadeIn"
        >
          🏠 Quay về trang chủ
        </Link>
      </div>
    </div>
    );
};

// Styles hoàn chỉnh cho giao diện
// const styles = {
//     container: {
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         backgroundColor: "#f8f9fa",
//     },
//     card: {
//         textAlign: "center",
//         padding: "40px",
//         borderRadius: "12px",
//         backgroundColor: "#fff",
//         boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//         maxWidth: "500px",
//         width: "90%",
//     },
//     image: {
//         width: "120px",
//         marginBottom: "20px",
//         marginLeft: "auto",
//         marginRight: "auto",
//         display: "block",
//     },
//     title: {
//         fontSize: "24px",
//         fontWeight: "bold",
//         color: "#333",
//         marginBottom: "10px",
//     },
//     text: {
//         fontSize: "16px",
//         color: "#666",
//         marginBottom: "20px",
//     },
//     orderCodeBox: {
//         backgroundColor: "#e9f5e9",
//         padding: "10px",
//         borderRadius: "8px",
//         display: "inline-block",
//         marginBottom: "20px",
//     },
//     orderCodeText: {
//         fontSize: "18px",
//         color: "#333",
//     },
//     checkIcon: {
//         marginRight: "5px",
//         fontSize: "20px",
//         color: "#28a745",
//     },
//     orderCode: {
//         fontWeight: "bold",
//         color: "#007bff",
//         marginLeft: "5px",
//     },
//     button: {
//         display: "inline-block",
//         padding: "12px 20px",
//         fontSize: "16px",
//         color: "#fff",
//         backgroundColor: "#007bff",
//         textDecoration: "none",
//         borderRadius: "8px",
//         fontWeight: "bold",
//         transition: "0.3s",
//     },
// };

export default ThankYou;
