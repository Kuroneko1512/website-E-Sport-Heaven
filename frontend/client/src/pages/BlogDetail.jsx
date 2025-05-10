import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogService from '../services/BlogService';

const BlogDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await BlogService.getById(id);
            setPost(response);
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-4xl mx-auto text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-900">Bài viết không tồn tại</h2>
                    <Link to="/blog" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">
                        ← Quay lại trang Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 bg-gray-100">
            <article className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                {post.thumbnail && (
                    <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        className="w-full h-96 object-cover"
                    />
                )}
                <div className="p-6">
                    <Link to="/blog" className="text-blue-500 hover:text-blue-700">
                        ← Quay lại trang Blog
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{post.title}</h1>
                    <div className="flex items-center text-gray-600 text-sm mb-6">
                        <span>{new Date(post.publish_date).toLocaleDateString('vi-VN')}</span>
                        {post.category_name && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{post.category_name}</span>
                            </>
                        )}
                    </div>
                    <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;