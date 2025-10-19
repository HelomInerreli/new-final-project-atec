import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Layout } from './pages/master/Layout'
import Home from './pages/Home'

function App() {


  return (
    <>
      <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
    </>
  )
}

export default App
