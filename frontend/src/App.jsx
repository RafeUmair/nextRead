import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MyBooksProvider } from './context/MyBooksContext'
import { PlaylistProvider } from './context/PlaylistContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Discovery from './pages/Discovery'
import MyBooks from './pages/MyBooks'
import NotFound from './pages/NotFound'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import BookDetail from './pages/BookDetail'
import Community from './pages/Community'
import Chat from './pages/Chat'

function WakeBanner() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = (Date.now() - start) / 45000
      setProgress(Math.min(elapsed * 100, 92))
    }, 300)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className="server-wake-banner flex-col gap-1 py-3">
      <div className="flex items-center gap-2">
        <div className="spinner spinner-sm" />
        <span>Waking up the server — this only happens on the first visit</span>
      </div>
      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function App() {
  const [showWakeBanner, setShowWakeBanner] = useState(false)

  useEffect(() => {
    let bannerTimer = setTimeout(() => setShowWakeBanner(true), 1000)

    fetch(`${import.meta.env.VITE_API_URL}/`)
      .finally(() => {
        clearTimeout(bannerTimer)
        setShowWakeBanner(false)
      })
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <MyBooksProvider>
          <PlaylistProvider>
          {showWakeBanner && <WakeBanner />}
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
            <Route path="/community" element={<Community />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PlaylistProvider>
        </MyBooksProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
