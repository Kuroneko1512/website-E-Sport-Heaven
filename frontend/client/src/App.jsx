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

import Checkout from './pages/Checkout'
import Register from './pages/Register'
import ShippingAddress from './pages/ShippingAddress'
import PaymentMethod from './pages/PaymentMethod'


function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Layout />} >
          <Route path='home' element={<Navigate to={'/'} />} />
          <Route index element={<Home />} />
          <Route path='shop' element={<Shop />} />
          <Route path='blog' element={<Blog />} />
          <Route path='story' element={<Story />} />
          <Route path='contact' element={<Contact />} />
          <Route path='*' element={<Notfound />} />
          <Route path='checkout' element={<Checkout />}/>
          <Route path='address' element={<ShippingAddress />}/>
          <Route path='payment' element={<PaymentMethod />}/>
          
        </Route>
      </Routes>
    </>
  )
}

export default App
