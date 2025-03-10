import React, { useContext } from 'react'
import logo from '../../assets/black-logo.png'
import logo2 from '../../assets/white-logo.png'
import ThemeContext from '../../contexts/ThemeContext'

const Logo = () => {

  const {isDarkMode} = useContext(ThemeContext)
  
  return (
    <div>
        <img src={isDarkMode ? logo2 : logo} className='w-20' alt="" />
    </div>
  )
}

export default Logo