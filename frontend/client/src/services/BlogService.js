import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const BlogService = {
  search: async (params) => {    
    for (const key in params) {
      if (!params[key]) {
        delete params[key];
      }
    }
    const response = await axios.get(`${API_URL}/blogs?${(new URLSearchParams(params)).toString()}`);
    return response.data?.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}`);
    return response.data?.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/blog-categories`);
    return response.data?.data;
  },
  
  getBySlug: async (slug) => {
    const response = await axios.get(`${API_URL}/blogs/slug/${slug}`);
    return response.data?.data; 
  }
};

export default BlogService;