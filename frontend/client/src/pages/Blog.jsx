import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogService from "../services/BlogService";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true);
      const response = await BlogService.search({ is_featured: true, page: 1, end_date: new Date().toISOString().slice(0, 10), });
      setFeaturedPosts(response.data);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
    } finally {
      setLoading(false);
    }
  };

  
  // Combine the fetching logic into one useEffect
  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        fetchCategories(),
        fetchFeaturedPosts(),
      ]);
    };
    initializePage();
  }, []);
  
  // Keep this useEffect for handling search and category changes
  useEffect(() => {
    handleSearch();
  }, [currentPage, categoryId]);

  // Remove the separate fetchPosts function since handleSearch now handles all post fetching

  const fetchCategories = async () => {
    try {
      const response = await BlogService.getCategories();
      setCategories([
        ...response.data,
        {
          id: null,
          name: "Tất cả",
        },
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = async () => {
    console.log("Searching...");
    
    try {
      setLoading(true);
      const response = await BlogService.search({
        keyword: searchTerm,
        category_id: categoryId,
        page: currentPage,
        end_date: new Date().toISOString().slice(0, 10),
      });
      setPosts(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen p-4">
      {/* Bài viết nổi bật */}
      {featuredPosts && featuredPosts.length > 0 && (
        <div className="bg-white  rounded-lg container mx-auto mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Bài viết nổi bật </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <section
                  key={post.id}
                  className="shadow-md rounded-lg overflow-hidden" style={{ height: "100%" }}
                >
                  <img
                    src={
                      post.thumbnail ??
                      "https://cdn4.wpbeginner.com/wp-content/uploads/2020/02/how-to-code-a-website.png"
                    }
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold">{post.title}</h2>
                    <p className="text-gray-700 mt-2">{post.description}</p>
                  </div>
                </section>
              </Link>
            ))}
          </div>
        </div>
      )}

      <main
        className="container p-6 rounded-lg mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 bg-white"
        style={{ minHeight: "800px" }}
      >
        {/* Tất cả bài viết */}
        <section className="md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Tất cả bài viết</h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {posts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.id}`}>
                  <div
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                    style={{ height: "100%" }}
                  >
                    <img
                      src={
                        post.thumbnail ??
                        "https://cdn4.wpbeginner.com/wp-content/uploads/2020/02/how-to-code-a-website.png"
                      }
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{post.title}</h3>
                      <p className="text-gray-700 mt-2">{post.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center mt-6">
              <button
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button
                  key={i}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === pagination.last_page
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.last_page)
                  )
                }
                disabled={currentPage === pagination.last_page}
              >
                »
              </button>
            </div>
          )}
        </section>

        {/* Danh mục bài viết */}
        <aside className="p-4 md:col-span-1 border-l border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Danh mục</h2>
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="w-full p-2 border border-gray-300 rounded-l-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setCurrentPage(1);
                handleSearch();
              }}
              className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              Tìm
            </button>
          </div>
          <ul>
            {categories.map((category) => (
              <li key={category.id} className="mb-2">
                <button
                  onClick={() => {
                    setCategoryId(category.id);
                    setCurrentPage(1);
                  }}
                  className="text-blue-500 font-medium hover:text-blue-700"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
};

export default Blog;
