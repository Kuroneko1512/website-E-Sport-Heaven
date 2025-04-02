import React, { useState } from "react";
import { Link } from "react-router-dom";

const categories = ["Bóng đá", "Gym & Fitness", "Chạy bộ", "Yoga"];

const featuredPost = {
    id: 15,
    title: "Cách chọn giày chạy bộ phù hợp",
    description: "Hướng dẫn chi tiết cách chọn giày chạy bộ giúp bảo vệ đôi chân và nâng cao hiệu suất...",
    image: "https://via.placeholder.com/400"
};

const posts = [
    { id: 1, title: "Lợi ích của tập gym mỗi ngày", description: "Tập gym không chỉ giúp tăng cường sức khỏe mà còn cải thiện tinh thần...", image: "https://via.placeholder.com/400" },
    { id: 2, title: "Bí quyết giảm cân hiệu quả", description: "Những cách giảm cân lành mạnh mà không ảnh hưởng đến sức khỏe...", image: "https://via.placeholder.com/400" },
    { id: 3, title: "Cách tập yoga đúng cách", description: "Hướng dẫn chi tiết về các tư thế yoga giúp cải thiện sức khỏe...", image: "https://via.placeholder.com/400" },
    { id: 4, title: "Chạy bộ mỗi sáng có lợi gì?", description: "Những tác động tích cực của việc chạy bộ buổi sáng...", image: "https://via.placeholder.com/400" },
    { id: 5, title: "Tập gym nên ăn gì?", description: "Những thực phẩm tốt nhất để giúp bạn tập gym hiệu quả hơn...", image: "https://via.placeholder.com/400" },
    { id: 6, title: "Cách chọn quần áo thể thao", description: "Những mẹo hữu ích để chọn trang phục thể thao phù hợp...", image: "https://via.placeholder.com/400" },
    { id: 7, title: "Cách tập yoga đúng cách", description: "Hướng dẫn chi tiết về các tư thế yoga giúp cải thiện sức khỏe...", image: "https://via.placeholder.com/400" },
    { id: 8, title: "Chạy bộ mỗi sáng có lợi gì?", description: "Những tác động tích cực của việc chạy bộ buổi sáng...", image: "https://via.placeholder.com/400" },
    { id: 9, title: "Tập gym nên ăn gì?", description: "Những thực phẩm tốt nhất để giúp bạn tập gym hiệu quả hơn...", image: "https://via.placeholder.com/400" },
    { id: 10, title: "Cách chọn quần áo thể thao", description: "Những mẹo hữu ích để chọn trang phục thể thao phù hợp...", image: "https://via.placeholder.com/400" },
    { id: 11, title: "Cách tập yoga đúng cách", description: "Hướng dẫn chi tiết về các tư thế yoga giúp cải thiện sức khỏe...", image: "https://via.placeholder.com/400" },
    { id: 12, title: "Chạy bộ mỗi sáng có lợi gì?", description: "Những tác động tích cực của việc chạy bộ buổi sáng...", image: "https://via.placeholder.com/400" },
    { id: 13, title: "Tập gym nên ăn gì?", description: "Những thực phẩm tốt nhất để giúp bạn tập gym hiệu quả hơn...", image: "https://via.placeholder.com/400" },
    { id: 14, title: "Cách chọn quần áo thể thao", description: "Những mẹo hữu ích để chọn trang phục thể thao phù hợp...", image: "https://via.placeholder.com/400" }
];

const Blog = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    const totalPages = Math.ceil(posts.length / postsPerPage);
    const displayedPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    return (
        <div className="bg-gray-100 text-gray-900 min-h-screen p-4">
            {/* Bài viết nổi bật */}
            <section className="max-w-6xl mx-auto mb-6 bg-white shadow-md rounded-lg overflow-hidden">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-64 object-cover" />
                <div className="p-6">
                    <h2 className="text-2xl font-bold">{featuredPost.title}</h2>
                    <p className="text-gray-700 mt-2">{featuredPost.description}</p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Tất cả bài viết */}
                <section className="md:col-span-3">
                    <h2 className="text-xl font-semibold mb-4">Tất cả bài viết</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayedPosts.map((post, index) => (
                            <Link to={`/blog/${post.id}`}>
                            <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-lg font-bold">{post.title}</h3>
                                    <p className="text-gray-700 mt-2">{post.description}</p>
                                </div>
                            </div>
                            </Link>
                        ))}
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-center mt-6">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button 
                                key={i} 
                                className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`} 
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Danh mục bài viết */}
                <aside className="bg-white shadow-md rounded-lg p-4 md:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Danh mục</h2>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm bài viết..." 
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul>
                        {categories.map((category, index) => (
                            <li key={index} className="mb-2">
                                <a href="#" className="text-blue-500 font-medium">{category}</a>
                            </li>
                        ))}
                    </ul>
                </aside>
            </main>
        </div>
    );
};

export default Blog;