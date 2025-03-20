import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'
import Footer from './components/footer/Footer'
import Categories from './components/categories/Categories'
import './App.css'
import Login from './components/authentification/login/Login'
import Register from './components/authentification/register/Register'
import Catalog from './components/catalog/Catalog'
import Details from './details/Details'
import { useState } from 'react'
import { UserContext } from './contexts/UserContext'


function App() {
  const [userData, setUserData] = useState({})

  const userLoginHandler = (data) => {
    setUserData(data);
  };

  return (
    <>
      <UserContext.Provider value={{...userData, userLoginHandler}}>

        <div id="container">
          <Header />

          <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoriId" element={<Catalog />} />
              <Route path="/categories/:categoriId/:itemId/details" element={<Details />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>

          </main>

          <Footer />
        </div>
      </UserContext.Provider>

    </>
  )
}

export default App
