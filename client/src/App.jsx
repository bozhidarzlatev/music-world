import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'
import Footer from './components/footer/Footer'
import Categories from './components/categories/Categories'
import './App.css'
import Login from './components/authentification/login/Login'
import Register from './components/authentification/register/Register'
import Catalog from './components/catalog/Catalog'
import { useState } from 'react'
import { UserContext } from './contexts/UserContext'
import Logout from './components/authentification/logout/Logout'
import CreateItem from './components/createItem/CreateItem'
import Details from './components/details/Details'
import EditItem from './components/editItem/EditItem'


function App() {
  const [userData, setUserData] = useState({})

  const userDateHandler = (data) => {
    
    setUserData(data);
  };


  return (
    <>
      <UserContext.Provider value={{...userData, userDateHandler}}>

        <div id="container">
          <Header />

          <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />} />
              <Route path="/categories" element={<Categories route="categories" action="Explore"/>} />
              <Route path="/categories/:categoriId" element={<Catalog />} />
              <Route path="/categories/:categoriId/:itemId/details" element={<Details />} />
              <Route path="/categories/:categoriId/:itemId/edit" element={<EditItem />} />
              <Route path="/create" element={<Categories route="create" action="Create"/>} />
              <Route path="/create/:addCategoryId" element={<CreateItem />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>

          </main>

          <Footer />
        </div>
      </UserContext.Provider>

    </>
  )
}

export default App
