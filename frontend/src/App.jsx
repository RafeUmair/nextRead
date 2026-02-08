import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MyBooksProvider } from './context/MyBooksContext'
import Home from './pages/Home'
import Discovery from './pages/Discovery'
import MyBooks from './pages/MyBooks'
import NotFound from './pages/NotFound'

function App() {
  return (
    <MyBooksProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MyBooksProvider>
  )
}

export default App
