import { useState } from 'react'
import './App.css'
import './Login.css'

function SetNameModal({ token, onComplete }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your full name'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/student/set-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.detail || 'Failed to save name')
      }
      const data = await res.json()
      onComplete(data.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>👋</div>
        <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 700, margin: '0 0 8px' }}>
          Welcome to Smart Campus!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: '0 0 32px' }}>
          Please enter your full name to complete your profile setup.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            autoFocus
            style={{
              width: '100%', padding: '14px 18px',
              background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '12px', color: '#fff',
              fontSize: '16px', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#7c6af7'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '13px', margin: '8px 0 0', textAlign: 'left' }}>
              ⚠ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '20px', width: '100%', padding: '14px',
              background: loading ? 'rgba(124,106,247,0.5)' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.3px',
            }}
          >
            {loading ? 'Saving...' : 'Continue to Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function App({ initialRole = null }) {
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [pendingToken, setPendingToken] = useState('')

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

  const fetchStudentProfile = async (token) => {
    const response = await fetch('http://localhost:8000/student/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Unable to fetch student profile.')
    }
    return response.json()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setLoginError('')

    if (role === 'student') {
      try {
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.detail || 'Invalid login credentials')
        }
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('role', 'student')
        localStorage.setItem('studentEmail', email)
        localStorage.setItem('studentBranch', '')
        localStorage.setItem('studentYear', '')
        localStorage.setItem('studentCourse', '')

        if (!data.name_set) {
          // First login — show name modal before entering the portal
          setPendingToken(data.access_token)
          setShowNameModal(true)
          setIsLoading(false)
          return
        }

        // Name already set — fetch profile and proceed
        const profile = await fetchStudentProfile(data.access_token)
        localStorage.setItem('studentName', profile.name || profile.email)
        localStorage.setItem('studentBranch', profile.branch || '')
        localStorage.setItem('studentYear', profile.year?.toString() || '')
        localStorage.setItem('studentCourse', profile.course || '')
        setIsSuccess(true)
        window.location.href = '/hero'
      } catch (err) {
        setLoginError(err.message)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (role === 'admin') {
      try {
        const response = await fetch('http://localhost:8000/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.detail || 'Invalid admin credentials')
        }
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('role', 'admin')
        localStorage.setItem('studentName', email.split('@')[0] || 'Admin')
        setIsSuccess(true)
        window.location.replace('/admin')
      } catch (err) {
        setLoginError(err.message)
      } finally {
        setIsLoading(false)
      }
      return
    }

    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      const name = email.split('@')[0] || (role === 'faculty' ? 'Faculty' : 'Student')
      localStorage.setItem('studentName', name)
      localStorage.setItem('studentEmail', email)
      localStorage.setItem('studentPassword', password)
      localStorage.setItem('role', role)
      if (!localStorage.getItem('studentBranch')) localStorage.setItem('studentBranch', '')
      if (!localStorage.getItem('studentYear')) localStorage.setItem('studentYear', '')
      if (!localStorage.getItem('studentCourse')) localStorage.setItem('studentCourse', '')
      window.location.href = role === 'faculty' ? '/faculty' : '/hero'
    }, 1500)
  }

  const handleNameSet = (savedName) => {
    localStorage.setItem('studentName', savedName)
    setShowNameModal(false)
    window.location.href = '/hero'
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
      {showNameModal && (
        <SetNameModal token={pendingToken} onComplete={handleNameSet} />
      )}
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
            <h2>Welcome Back, {role === 'faculty' ? 'Faculty' : role === 'admin' ? 'Admin' : 'Student'}!</h2>
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
              {role === 'faculty'
                ? 'Faculty Login'
                : role === 'admin'
                ? 'Admin Login'
                : 'Student/Parent Login'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}
              
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {role === 'faculty' ? 'Faculty Email' : role === 'admin' ? 'Admin Email' : 'Email'}
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder={
                      role === 'faculty'
                        ? 'faculty@campus.edu'
                        : role === 'admin'
                        ? 'admin@campus.edu'
                        : 'studentrollno@amritasai.orgg.in'
                    }
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
