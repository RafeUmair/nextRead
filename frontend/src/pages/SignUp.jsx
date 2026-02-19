import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(formData.email, formData.password, formData.name)
      navigate('/')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container-main flex items-center justify-center py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p style={{ color: 'var(--text-gray)' }}>Start tracking your reading journey</p>
          </div>

          <form onSubmit={handleSubmit} className="form-card">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="form-input"
              />
            </div>

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
                placeholder="Create a password"
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-orange w-full rounded-lg text-lg">
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <p className="text-center text-sm" style={{ color: 'var(--text-gray)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-orange font-medium hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
