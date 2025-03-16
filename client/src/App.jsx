import { useState } from 'react'
import Header from './components/header/Header'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="container">
      <Header />
      
      <h1>Music World</h1>
    </div>
    </>
  )
}

export default App
