import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MyBooksProvider } from './context/MyBooksContext'
import Home from './pages/Home'
import Discovery from './pages/Discovery'
import MyBooks from './pages/MyBooks'
import NotFound from './pages/NotFound'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <MyBooksProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MyBooksProvider>
  )
}

export default App
