import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instanceAxios from "../config/db";

const GoogleAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoogleAuth = async () => {
      try {
        const response = await fetch(`/api/auth/google/callback${location.search}`, {
          headers: new Headers({ accept: "application/json" }),
        });

        if (!response.ok) {
          throw new Error("Xác thực Google thất bại!");
        }

        const data = await response.json();
        
        // Lưu token vào redux hoặc localStorage
        instanceAxios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

        // Chuyển hướng về trang chính
        navigate("/");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleAuth();
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      {loading && <p>Đang xử lý đăng nhập...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}
    </div>
  );
};

export default GoogleAuthCallback;