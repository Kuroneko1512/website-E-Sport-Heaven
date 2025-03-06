import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const LoginAlert = () => {
  const navigate = useNavigate();

  useEffect(() => {
    MySwal.fire({
      iconHtml:
        '<div style="width: 60px; height: 60px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center;"><span style="font-size: 30px; color: black;">✕</span></div>',
      title: "<strong>You must log in to view</strong>",
      html: `<p>After logging in you can view products in the minicart</p>`,
      showConfirmButton: true,
      confirmButtonText: "Login",
      confirmButtonColor: "black",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login"); // Điều hướng khi bấm vào nút
      }
    });
  }, [navigate]); // useEffect sẽ chỉ chạy khi component được mount
  return null; // Không hiển thị gì trên giao diện
};

export default LoginAlert;
