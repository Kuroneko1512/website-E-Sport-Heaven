import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)
const Success = () => {
    MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Your action was completed successfully.",
        confirmButtonColor: "green",
      });
}

export default Success