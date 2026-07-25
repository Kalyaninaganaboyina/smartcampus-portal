import React, { useState } from 'react'
import menuIcon from './assets/menu.svg'
import './Navbar.css'

function Navbar({ role = 'student', onDashboardClick, onProfileClick, studentName = 'Student' }) {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [closedBanner, setClosedBanner] = useState(false)

  const isDefaultPassword = localStorage.getItem('isDefaultPassword') === 'true'
  const isProfileIncomplete = role === 'student' && (!localStorage.getItem('studentBranch') || !localStorage.getItem('studentYear') || !localStorage.getItem('studentCourse'))
  const showBanner = role === 'student' && (isDefaultPassword || isProfileIncomplete) && !closedBanner

  const basePath = role === 'faculty' ? '/faculty' : role === 'admin' ? '/admin' : '/hero'
  const handleDashboard = () => {
    setIsNavMenuOpen(false)
    if (onDashboardClick) onDashboardClick()
    else window.location.href = `${basePath}`
  }

  const handleUploadMarks = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/admin#marks'
  }

  const handleUploadAttendance = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/admin#attendance'
  }

  const handleUploadFees = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/admin#fees'
  }

  const handleAttendance = () => {
    setIsNavMenuOpen(false)
    window.location.href = role === 'faculty' ? '/faculty#attendance' : '/attendance'
  }

  const handlePercentage = () => {
    setIsNavMenuOpen(false)
    window.location.href = role === 'faculty' ? '/faculty#percentage' : '/percentage'
  }

  const handleSyllabus = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/faculty#syllabus'
  }

  const handleQuestionPapers = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/faculty#question-papers'
  }

  const handleResources = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/faculty#resources'
  }

  const handleSchedule = () => {
    setIsNavMenuOpen(false)
    window.location.href = '/faculty#schedule'
  }

  const toggleMenu = () => {
    setIsNavMenuOpen((s) => !s)
    setIsProfileMenuOpen(false)
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((s) => !s)
    setIsNavMenuOpen(false)
  }

  const handleProfileAction = (action) => {
    setIsProfileMenuOpen(false)
    if (onProfileClick) onProfileClick(action)
    else {
      if (action === 'profile') window.location.href = '/profile'
      if (action === 'logout') {
        try { localStorage.clear() } catch (e) {}
        window.location.href = '/'
      }
    }
  }

  return (
    <>
      {showBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          fontWeight: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>
              <strong>Security Action Required:</strong> Please update your profile details and change your default password immediately.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => window.location.href = '/profile'}
              style={{
                background: '#fff',
                color: '#ef4444',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Update Now
            </button>
            <button 
              onClick={() => setClosedBanner(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <nav className="app-nav" style={{ top: showBanner ? '64px' : '16px', transition: 'top 0.3s ease' }}>
        <div className="nav-left">
          <button
            onClick={toggleMenu}
            className="nav-icon-btn"
            aria-label="Toggle menu"
            aria-expanded={isNavMenuOpen}
          >
            <img src={menuIcon} alt="Menu" />
          </button>

          {isNavMenuOpen && (
            <div className="nav-menu-dropdown">
              <button onClick={handleDashboard}>Dashboard</button>
              {role === 'faculty' ? (
                <>
                  <button onClick={handleSyllabus}>Syllabus</button>
                  <button onClick={handleQuestionPapers}>Question Papers</button>
                  <button onClick={handleResources}>Resources</button>
                  <button onClick={handleSchedule}>Schedule</button>
                </>
              ) : role === 'admin' ? (
                <>
                  <button onClick={handleUploadMarks}>Upload Marks</button>
                  <button onClick={handleUploadAttendance}>Upload Attendance</button>
                  <button onClick={handleUploadFees}>Upload Fees</button>
                </>
              ) : (
                <>
                  <button onClick={handleAttendance}>Attendance</button>
                  <button onClick={handlePercentage}>Percentage</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>

          <div className="nav-profile-wrapper">
            <button
              onClick={toggleProfileMenu}
              className="nav-profile-button"
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="profile-avatar">
                <span>{studentName.charAt(0).toUpperCase()}</span>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="profile-menu">
                <button onClick={() => handleProfileAction('profile')}>Profile</button>
                <button onClick={() => handleProfileAction('logout')}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
