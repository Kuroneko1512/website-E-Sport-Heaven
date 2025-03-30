// File: components/PasswordChangedPopup.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'sweetalert2/dist/sweetalert2.min.css';

const MySwal = withReactContent(Swal);

export const PasswordChangedSS = () => {
  const navigate = useNavigate();

  useEffect(() => {
    MySwal.fire({
      html: `
        <div class="text-center p-6 animate-fadeIn">
          <div class="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center animate-pulse">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17l-3.88-3.88L4 13.41 9 18.41 20 7.41 18.59 6l-9.59 9.59z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold mb-2">Mật khẩu đã đổi thành công!</h2>
          <p class="text-gray-600 mb-6">Mật khẩu của bạn đã được đổi thành công!</p>
          <button 
            id="backToLoginBtn"
            class="bg-black text-white py-3 px-6 rounded-lg w-full text-base hover:bg-gray-800 transition duration-300"
          >
            Trở lại trang đăng nhập
          </button>
        </div>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const btn = Swal.getPopup().querySelector('#backToLoginBtn');
        btn.addEventListener('click', () => {
          Swal.close();
          navigate('/login')});
      },
      background: '#fff',
      width: '400px',
      padding: '0',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
      },
    });
  }, [navigate]);

  return null;
};
