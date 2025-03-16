import { Routes, Route } from 'react-router'

import Header from './components/header/Header'
import Home from './components/home/Home'

function App() {

  return (
    <>
      <div id="container">
        <Header />

        <main id="main-contennt" >

            <Routes>
              <Route index element={<Home />}/>
            </Routes>

        </main>
      </div>
    </>
  )
}

export default App
