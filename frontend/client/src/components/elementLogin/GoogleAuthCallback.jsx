import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/AuthSide";
import { Spin, Alert } from "antd";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Lấy code từ URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code');
    
    console.log("Google Auth Callback - Code:", code);
    
    if (!code) {
      console.error("No authorization code found in URL");
      setError("Không tìm thấy mã xác thực từ Google");
      setLoading(false);
      return;
    }
    
    // Tự động gửi code đến backend
    sendCodeToBackend(code);
  }, []);
  
  // Hàm gửi code đến backend
  const sendCodeToBackend = async (code) => {
    try {
      console.log("Sending authorization code to backend...");
      
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/customer/auth/social/google/callback",
        { token: code },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log("Response from backend:", response.data);
      
      // Nếu đăng nhập thành công
      if (response.data.success) {
        const { access_token, refresh_token, user, expires_at, expires_in } = response.data.data;
        
        // Lưu thông tin vào Redux store (giống như đăng nhập thông thường)
        dispatch(
          login({
            accessToken: access_token,
            refreshToken: refresh_token,
            user: {
              avatar: user.avatar,
              name: user.name,
              email: user.email,
              phone: user.phone,
            },
            expiresAt: expires_at,
            expiresIn: expires_in,
          })
        );
        
        // Chuyển hướng về trang chủ
        setTimeout(() => {
          navigate('/');
          setLoading(false);
        }, 10);
      } else {
        console.error("Login failed:", response.data.message);
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Error sending code to backend:", err);
      setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi xác thực với Google");
    } finally {
      setLoading(false);
    }
  };
  
  // Hiển thị giao diện tối giản
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Đang xác thực với Google</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
          </div>
        ) : error ? (
          <Alert
            message="Lỗi xác thực"
            description={error}
            type="error"
            showIcon
            action={
              <button
                onClick={() => navigate('/login')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Quay lại đăng nhập
              </button>
            }
          />
        ) : (
          <Alert
            message="Xác thực thành công"
            description="Đang chuyển hướng về trang chủ..."
            type="success"
            showIcon
          />
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;