import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)
const Success = () => {
    MySwal.fire({
        icon: "success",
        title: "Thành Công!",
        text: "Đăng nhập thành công.",
        confirmButtonColor: "green",
      });
}

export default Success