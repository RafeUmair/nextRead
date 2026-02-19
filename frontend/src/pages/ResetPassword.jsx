import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSubmitted(true)
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
            <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
            <p style={{ color: 'var(--text-gray)' }}>Enter your email and we will send you a reset link</p>
          </div>

          {submitted ? (
            <div className="form-card text-center">
              <p className="text-lg font-medium mb-2">Check your email</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <Link to="/login" className="text-orange font-medium hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-orange w-full rounded-lg text-lg">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--text-gray)' }}>
                Remember your password?{' '}
                <Link to="/login" className="text-orange font-medium hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
