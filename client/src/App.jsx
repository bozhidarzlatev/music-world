import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'
import Footer from './components/footer/Footer'
import Categories from './components/categories/Categories'
import './App.css'
import Login from './components/authentification/login/Login'
import Register from './components/authentification/register/Register'


function App() {

  return (
    <>
      <div id="container">
        <Header />

        <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />}/>
              <Route path="/categories" element={<Categories />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/register" element={<Register />}/>
            </Routes>

        </main>

        <Footer />
      </div>

    </>
  )
}

export default App
