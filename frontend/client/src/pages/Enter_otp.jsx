import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Enter_otp = () => {
  useEffect(() => {
    const inputs = document.querySelectorAll('input[type="text"]');

    inputs.forEach((input, index) => {
      // Handle input event
      input.addEventListener('input', () => {
        if (input.value.length === 1) {
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          } else {
            document.getElementById('otpForm').submit();
          }
        }
      });

      // Handle backspace event
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
          inputs[index - 1].focus(); // Move focus to the previous input
          inputs[index - 1].value = ''; // Clear the previous input
        }
      });
    });
  }, []);

  return (
    <div className="bg-gray-100">
      <div className="flex min-h-screen">
        {/* Left Image Section */}
        <div className="w-1/2 hidden md:block">
          <img
            alt="Person sitting in a chair with geometric light structures"
            className="w-full h-full object-cover"
            height="1000"
            src="https://placehold.co/800x1000"
            width="800"
          />
        </div>
        {/* Right Form Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
          <div className="max-w-md w-full p-8">
            <div className="flex items-center mb-6">
              <i className="fas fa-chevron-left text-lg mr-2"></i>
              <Link to={'/reset-password'} className="text-lg">Back</Link>
            </div>
            <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
            <p className="text-gray-500 mb-4">
              We have shared a code to your registered email address
            </p>
            <p className="text-gray-500 mb-6">robertfox@example.com</p>
            <form id="otpForm" action="/verify" method="POST">
              <div className="flex space-x-2 mb-6">
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp1"
                />
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp2"
                />
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp3"
                />
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp4"
                />
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp5"
                />
                <input
                  autoComplete="off"
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl"
                  maxLength="1"
                  type="text"
                  name="otp6"
                />
              </div>
              <button
                className="w-full bg-black text-white py-3 rounded-lg text-lg"
                type="submit"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enter_otp;