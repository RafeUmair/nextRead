import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MyBooksProvider } from './context/MyBooksContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Discovery from './pages/Discovery'
import MyBooks from './pages/MyBooks'
import NotFound from './pages/NotFound'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import BookDetail from './pages/BookDetail'

function App() {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/`).catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <MyBooksProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/my-books" element={
              <ProtectedRoute><MyBooks /></ProtectedRoute>
            } />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/book/:workId" element={<BookDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MyBooksProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
