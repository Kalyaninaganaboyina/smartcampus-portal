import { useState } from 'react'
import './App.css'
import './Login.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const tempErrors = {}
    if (!email.trim()) {
      tempErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      tempErrors.password = 'Password is required'
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate authentication API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      const name = email.split('@')[0] || (role === 'faculty' ? 'Faculty' : 'Student')
      localStorage.setItem('studentName', name)
      localStorage.setItem('role', role)
      if (role === 'student') {
        window.location.href = '/hero'
      } else if (role === 'faculty') {
        window.location.href = '/faculty'
      }
    }, 1500)
  }

  const handleBackToRoleSelection = () => {
    setRole(null)
    setEmail('')
    setPassword('')
    setErrors({})
    setIsSuccess(false)
    setShowPassword(false)
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {role === null ? (
          <>
            {/* Header */}
            <div className="brand-header">
              <span className="brand-logo" role="img" aria-label="Graduation Cap">🎓</span>
              <div className="brand-text-container">
                <h1 className="brand-title-main">Smart Campus</h1>
                <h1 className="brand-title-main">Portal</h1>
              </div>
            </div>
            <p className="brand-subtitle">Select your portal to log in</p>

            <div className="role-selection-container">
              <button 
                type="button" 
                className="role-card" 
                onClick={() => setRole('faculty')}
              >
                <div className="role-icon">👨‍🏫</div>
                <div className="role-details">
                  <span className="role-title">Faculty Portal</span>
                  <span className="role-desc">Sign in to manage classes, grades, and schedules</span>
                </div>
              </button>

              <button 
                type="button" 
                className="role-card" 
                onClick={() => setRole('student')}
              >
                <div className="role-icon">🎓</div>
                <div className="role-details">
                  <span className="role-title">Student / Parent Portal</span>
                  <span className="role-desc">Sign in to view classes, academic records, and fees</span>
                </div>
              </button>
            </div>
          </>
        ) : isSuccess ? (
          <div className="success-banner">
            <div className="success-icon">🎉</div>
            <h2>Welcome Back, {role === 'faculty' ? 'Faculty' : 'Student'}!</h2>
            <p>Login successful. Redirecting to your dashboard...</p>
            
          </div>
        ) : (
          <>
            {/* Back Button */}
            <button 
              type="button" 
              className="back-btn" 
              onClick={handleBackToRoleSelection}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>

            {/* Header */}
            <div className="brand-header">
              <span className="brand-logo" role="img" aria-label="Graduation Cap">
                {role === 'faculty' ? '💼' : '🎓'}
              </span>
              <div className="brand-text-container">
                <h1 className="brand-title-main">Smart Campus</h1>
                <h1 className="brand-title-main">Portal</h1>
              </div>
            </div>
            <p className="brand-subtitle">
              {role === 'faculty' ? 'Faculty Login' : 'Student/Parent Login'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {role === 'faculty' ? 'Faculty Email' : 'Email'}
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder={role === 'faculty' ? "faculty@campus.edu" : "studentrollno@amritasai.orgg.in"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <div className="error-banner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`form-input password-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: '' })
                    }}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-banner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default App
