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
import Cart from './components/cart/Cart'
import Orders from './components/orders/Orders'
import Profile from './components/profile/Profile'
import Search from './components/search/Search'
import { CartProvider } from './providers/CartProvider'
import NotFound from './components/notfount/NotFound'
import { ToastProvider } from './providers/ToastProvide'
import UserReviews from './components/review/userReviews/UserReviews'
import UserITems from './components/profile/userItems/UserItems'
import UserItems from './components/profile/userItems/UserItems'


function App() {

  return (
    <>
      <UserProvider>
        <CartProvider>
          <ToastProvider>
        <div id="container">
          <Header />

          <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />} />
              <Route path="/categories" element={<Categories route="categories" action="Explore" />} />
              <Route path="/categories/:categoriId" element={<Catalog />} />
              <Route path="/categories/:categoriId/:itemId/details" element={<Details />} />
              <Route path="/search" element={<Search />} />
              <Route element={<AuthGuard />}>

                <Route path="/categories/:categoriId/:itemId/edit" element={<EditItem />} />
                <Route path="/create" element={<Categories route="create" action="Create" />} />
                <Route path="/create/:addCategoryId" element={<CreateItem />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reviews" element={<UserReviews />} />
                <Route path="/useritems" element={<UserItems />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route element={<GuestGuard />}>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Routes>

          </main>

          <Footer />
        </div>
        </ToastProvider>
        </CartProvider>
      </UserProvider>

    </>
  )
}

export default App
