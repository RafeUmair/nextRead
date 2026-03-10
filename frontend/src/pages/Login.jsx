import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'

const getAuthError = (err) => {
  const messages = {
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-disabled':           'This account has been disabled.',
    'auth/too-many-requests':       'Too many failed attempts. Try again later.',
    'auth/network-request-failed':  'Network error. Check your connection.',
  }
  return messages[err.code] || 'Something went wrong. Please try again.'
}

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate(redirect)
    } catch (err) {
      setError(getAuthError(err))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container-main flex items-center justify-center py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p style={{ color: 'var(--text-gray)' }}>Log in to continue your reading journey</p>
          </div>

          <form onSubmit={handleSubmit} className="form-card">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                className="form-input"
              />
              <div className="text-right mt-1">
                <Link to="/reset-password" className="text-sm text-orange font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-orange w-full rounded-lg text-lg">
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-center text-sm" style={{ color: 'var(--text-gray)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange font-medium hover:underline">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
