import React, { useState } from 'react'
import Navbar from './Navbar'
import ChatBox from './ChatBox'
import './Hero.css'

function Hero() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const studentName = localStorage.getItem('studentName') || 'Student'
  const role = localStorage.getItem('role') || null

  const toggleChat = () => {
    setIsChatOpen((open) => !open)
  }

  return (
    <div className="hero-page">
      <Navbar studentName={studentName} />
      <main className="hero-main">
        <section className="hero-intro">
          <div className="hero-copy">
            <div className="hero-badge">Student Portal</div>
            <h1 className="hero-title">Welcome back, {studentName}.</h1>
            <p className="hero-text">
              Your Profile. Track attendance, view grades,
              and stay connected with announcements.
            </p>
            <div className="hero-actions">
              <button className="hero-btn primary" type="button" onClick={() => window.location.href = '/dashboard'}>Open Dashboard</button>
              <button className="hero-btn secondary" type="button" onClick={() => window.location.href = '/attendance'}>View Attendance</button>
              {role === 'student' && (
                <button className="hero-btn chat" type="button" onClick={toggleChat}>
                  {isChatOpen ? 'Hide Chat' : 'Open Chat'}
                </button>
              )}
            </div>
          </div>

          <aside className="hero-panel">
            <div className="hero-panel-content">
              <h2 className="hero-panel-title">Student Insights</h2>
              <p className="hero-panel-text">
                Get a quick snapshot of your recent activity, upcoming deadlines, and performance trends.
              </p>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div>
                    <div className="hero-stat-label">Attendance</div>
                    <div className="hero-stat-value">98%</div>
                  </div>
                  <div>Excellent</div>
                </div>
                <div className="hero-stat">
                  <div>
                    <div className="hero-stat-label">GPA Scored</div>
                    <div className="hero-stat-value">9.2</div>
                  </div>
                  <div>On Track</div>
                </div>
              </div>

              <div className="hero-cards">
                <div className="hero-card" onClick={() => window.location.href = '/dashboard'} style={{ cursor: 'pointer' }}>
                  <div className="hero-card-title">Next Assignment</div>
                  <p className="hero-card-text">Submit your AI coursework by Next class to keep your streak going.</p>
                  <div className="hero-card-cta">See details →</div>
                </div>
                <div className="hero-card" onClick={() => window.location.href = '/percentage'} style={{ cursor: 'pointer' }}>
                  <div className="hero-card-title">Upcoming Quiz</div>
                  <p className="hero-card-text">Prepare for the data structures quiz scheduled for Tuesday.</p>
                  <div className="hero-card-cta">Review topics →</div>
                </div>
                {role === 'student' && (
                  <div className="hero-card" onClick={toggleChat} style={{ cursor: 'pointer' }}>
                    <div className="hero-card-title">Messages</div>
                    <p className="hero-card-text">Chat with your mentor or class representatives directly.</p>
                    <div className="hero-card-cta">Open chat →</div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>

      {role === 'student' && isChatOpen && <ChatBox studentName={studentName} onClose={toggleChat} />}
    </div>
  )
}

export default Hero
