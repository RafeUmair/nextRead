import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Log in:', formData)
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

            <button type="submit" className="btn btn-orange w-full rounded-lg text-lg">
              Log In
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
