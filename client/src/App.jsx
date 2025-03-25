import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'
import Footer from './components/footer/Footer'
import Categories from './components/categories/Categories'
import './App.css'
import Login from './components/authentification/login/Login'
import Register from './components/authentification/register/Register'
import Catalog from './components/catalog/Catalog'
import Logout from './components/authentification/logout/Logout'
import CreateItem from './components/createItem/CreateItem'
import Details from './components/details/Details'
import EditItem from './components/editItem/EditItem'
import UserProvider from './providers/UserProvider'
import AuthGuard from './components/guards/AuthGuard'
import GuestGuard from './components/guards/GuestGuard'


function App() {

  return (
    <>
      <UserProvider>

        <div id="container">
          <Header />

          <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />} />
              <Route path="/categories" element={<Categories route="categories" action="Explore" />} />
              <Route path="/categories/:categoriId" element={<Catalog />} />
              <Route path="/categories/:categoriId/:itemId/details" element={<Details />} />
              <Route element={<AuthGuard />}>

                <Route path="/categories/:categoriId/:itemId/edit" element={<EditItem />} />
                <Route path="/create" element={<Categories route="create" action="Create" />} />
                <Route path="/create/:addCategoryId" element={<CreateItem />} />
                <Route path="/logout" element={<Logout />} />
              </Route>

              <Route element={<GuestGuard />}>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Routes>

          </main>

          <Footer />
        </div>
      </UserProvider>

    </>
  )
}

export default App
