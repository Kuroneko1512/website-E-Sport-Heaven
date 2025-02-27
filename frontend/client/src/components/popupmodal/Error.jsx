import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const Error = () => {
    MySwal.fire({
        icon: "error",
        title: "Oops!",
        text: "Something went wrong.",
        confirmButtonColor: "red",
      });
}

export default Error