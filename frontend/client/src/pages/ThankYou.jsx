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
        <div style={styles.container}>
            <div style={styles.card}>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/5290/5290058.png"
                    alt="Success"
                    style={styles.image}
                />
                <h1 style={styles.title}>🎉 Cảm ơn bạn đã đặt hàng! 🎉</h1>
                <p style={styles.text}>Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ sớm liên hệ với bạn.</p>

                {orderCode && (
                    <div style={styles.orderCodeBox}>
                        <h2 style={styles.orderCodeText}>
                            <span style={styles.checkIcon}>✅</span> Mã đơn hàng của bạn:{" "}
                            <strong style={styles.orderCode}>{orderCode}</strong>
                        </h2>
                    </div>
                )}

                <Link to="/" style={styles.button}>
                    🏠 Quay về trang chủ
                </Link>
            </div>
        </div>
    );
};

// Styles hoàn chỉnh cho giao diện
const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
    },
    card: {
        textAlign: "center",
        padding: "40px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        width: "90%",
    },
    image: {
        width: "120px",
        marginBottom: "20px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "10px",
    },
    text: {
        fontSize: "16px",
        color: "#666",
        marginBottom: "20px",
    },
    orderCodeBox: {
        backgroundColor: "#e9f5e9",
        padding: "10px",
        borderRadius: "8px",
        display: "inline-block",
        marginBottom: "20px",
    },
    orderCodeText: {
        fontSize: "18px",
        color: "#333",
    },
    checkIcon: {
        marginRight: "5px",
        fontSize: "20px",
        color: "#28a745",
    },
    orderCode: {
        fontWeight: "bold",
        color: "#007bff",
        marginLeft: "5px",
    },
    button: {
        display: "inline-block",
        padding: "12px 20px",
        fontSize: "16px",
        color: "#fff",
        backgroundColor: "#007bff",
        textDecoration: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        transition: "0.3s",
    },
};

export default ThankYou;
