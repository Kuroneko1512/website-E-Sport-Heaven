import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './layout/Layout'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Notfound from './pages/Notfound'
import Shop from './pages/Shop'
import Blog from './pages/Blog'
import Story from './pages/Story'
import Contact from './pages/Contact'

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Layout />} >
          <Route path='home' element={<Navigate to={'/'} />} />
          <Route index element={<Home />} />
          <Route path='shop' element={<Shop />} />
          <Route path='blog' element={<Blog />} />
          <Route path='story' element={<Story />} />
          <Route path='contact' element={<Contact />} />
          <Route path='*' element={<Notfound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
