import React from 'react'
import { Link } from 'react-router-dom'

const Notfound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default Notfound