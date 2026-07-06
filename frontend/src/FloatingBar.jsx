import React from 'react'
import homeIcon from './assets/home-alt.svg'
import './FloatingBar.css'

function FloatingBar() {
  const goHome = () => {
    try {
      const role = localStorage.getItem('role')
      window.location.href = role === 'faculty' ? '/faculty' : '/hero'
    } catch (e) { }
  }

  return (
    <div className="floating-bar" role="navigation" aria-label="Floating actions">
      <button className="fb-btn" onClick={goHome} aria-label="Home">
        <span className="fb-icon">
          <img src={homeIcon} alt="Home" />
        </span>
        Home
      </button>
    </div>
  )
}

export default FloatingBar
