import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'
import Footer from './components/footer/Footer'
import Categories from './components/categories/Categories'
import './App.css'


function App() {

  return (
    <>
      <div id="container">
        <Header />

        <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />}/>
              <Route path="/categories" element={<Categories />}/>
            </Routes>

        </main>

        <Footer />
      </div>

    </>
  )
}

export default App
