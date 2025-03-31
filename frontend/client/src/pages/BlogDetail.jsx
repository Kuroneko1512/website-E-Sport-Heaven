import React from 'react'
import { useParams } from 'react-router-dom'
import Blog from './Blog';

const BlogDetail = () => {
    const {id} = useParams()
  return (
    <div className='h-screen'>
      <span>BlogDetail {id}</span>
    </div>
  )
}

export default BlogDetail