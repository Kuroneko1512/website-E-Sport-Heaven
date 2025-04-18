import React from 'react' 
import { Link } from 'react-router-dom'

const Notfound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-800 text-black dark:text-white">
      <h1 className="text-6xl font-bold mb-4 text-red-500 dark:text-red-400">404</h1>
      <h2 className="text-2xl mb-6">Không tìm thấy trang</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Rất tiếc! Trang bạn đang tìm kiếm không tồn tại.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-black dark:bg-gray-700 text-white dark:text-gray-300 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-300"
      >
        Quay về trang chủ
      </Link>
    </div>
  )
}

export default Notfound