import React, { useState } from 'react'
import menuIcon from './assets/menu.svg'
import './Navbar.css'

function Navbar({ role = 'student', onDashboardClick, onProfileClick, studentName = 'Student' }) {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

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
    <nav className="app-nav">
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
  )
}

export default Navbar
