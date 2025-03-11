import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Forgot_Password = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/reset_password', dataUser);
      setSuccess(true);
      setError(false);
    } catch (err) {
      setError(true);
      setSuccess(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full">
        <img
          alt="A person in a flowing yellow dress reaching up towards the sky with a background of blue sky and white clouds"
          className="w-full h-full object-cover"
          height="1200"
          src="https://storage.googleapis.com/a1aa/image/QSkj2oGzfgx0OS7Ry9JiZcyvz74JmrH6L3n9fzEIp1FO8lHUA.jpg"
          width="800"
        />
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-3/4">
          <a className="flex items-center text-gray-500 mb-6" href="#">
            <i className="fas fa-chevron-left"></i>
            <Link to="/login" className="ml-2">Back</Link>
          </a>
          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-gray-500 mb-6">
            Enter your registered email address. We'll send you a code to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="w-full py-2 px-4 bg-black text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="submit"
            >
              Send OTP
            </button>
          </form>
          {success && <p className="text-green-500 mt-4">OTP has been sent to your email.</p>}
          {error && <p className="text-red-500 mt-4">Failed to send OTP. Please try again.</p>}
        </div>
      </div>
    </div>
  );
};

export default Forgot_Password;