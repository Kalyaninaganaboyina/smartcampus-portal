import React, { useState } from 'react'
import Navbar from './Navbar'
import ChatBox from './ChatBox'
import FloatingBar from './FloatingBar'
import './Faculty.css'

function Faculty() {
  const userName = localStorage.getItem('studentName') || 'Faculty'
  const role = localStorage.getItem('role') || 'faculty'
  const [isChatOpen, setIsChatOpen] = useState(false)

  const toggleChat = () => {
    setIsChatOpen((open) => !open)
  }

  return (
    <div className="faculty-page">
      <Navbar role={role} studentName={userName} />

      <main className="faculty-main">
        <section className="faculty-hero">
          <div className="faculty-copy">
            <div className="faculty-badge">Faculty Portal</div>
            <h1 className="faculty-title">Welcome back, {userName}.</h1>
            <p className="faculty-text">
              Manage syllabus, question papers, resources, and class schedules from one premium dashboard.
            </p>
            <div className="faculty-actions">
              <button className="faculty-btn primary" type="button" onClick={() => window.location.href = '/faculty#syllabus'}>
                Syllabus
              </button>
              <button className="faculty-btn secondary" type="button" onClick={() => window.location.href = '/faculty#question-papers'}>
                Question Papers
              </button>
              <button className="faculty-btn chat" type="button" onClick={toggleChat}>
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
              </button>
            </div>
          </div>

          <aside className="faculty-panel">
            <div className="faculty-panel-content">
              <h2 className="faculty-panel-title">Teaching Highlights</h2>
              <p className="faculty-panel-text">
                Keep your classes aligned with the latest syllabus, share past exams, and coordinate with students effortlessly.
              </p>

              <div className="faculty-stats">
                <div className="faculty-stat">
                  <div>
                    <div className="faculty-stat-label">Courses Active</div>
                    <div className="faculty-stat-value">5</div>
                  </div>
                  <div>Stable</div>
                </div>
                <div className="faculty-stat">
                  <div>
                    <div className="faculty-stat-label">Pending Reviews</div>
                    <div className="faculty-stat-value">8</div>
                  </div>
                  <div>On Track</div>
                </div>
              </div>

              <div className="faculty-cards">
                <div className="faculty-card" id="syllabus">
                  <div className="faculty-card-title">Syllabus Updates</div>
                  <p className="faculty-card-text">Share curriculum changes and resource links with your students in one click.</p>
                  <div className="faculty-card-cta">Edit syllabus</div>
                </div>
                <div className="faculty-card" id="question-papers">
                  <div className="faculty-card-title">Question Papers</div>
                  <p className="faculty-card-text">Upload past exams or review papers to help students prepare smarter.</p>
                  <div className="faculty-card-cta">Upload papers</div>
                </div>
                <div className="faculty-card" id="resources">
                  <div className="faculty-card-title">Resources</div>
                  <p className="faculty-card-text">Add reading materials, lecture slides, and reference notes for each course.</p>
                  <div className="faculty-card-cta">Manage resources</div>
                </div>
                <div className="faculty-card" id="schedule">
                  <div className="faculty-card-title">Schedule</div>
                  <p className="faculty-card-text">View your weekly teaching plan, meetings, and deadlines at a glance.</p>
                  <div className="faculty-card-cta">Open schedule</div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {isChatOpen && <ChatBox studentName={userName} onClose={toggleChat} />}
      <FloatingBar />
    </div>
  )
}

export default Faculty
