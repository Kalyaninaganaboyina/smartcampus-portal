import React, { useEffect, useState } from 'react'
import ChatBox from './ChatBox'
import Profile from './Profile'
import { Attendance as AttendanceComponent, Percentage as MarksComponent } from './StudentPages'
import './StudentPortal.css'
import { API_BASE_URL } from './config'

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [marksData, setMarksData] = useState([])
  const [feesData, setFeesData] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token || role !== 'student') {
      window.location.replace('/')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch Profile
        const profRes = await fetch(`${API_BASE_URL}/student/profile`, { headers })
        if (profRes.ok) {
          const pData = await profRes.json()
          setProfile(pData)
        }

        // Fetch Attendance
        const attRes = await fetch(`${API_BASE_URL}/student/profile/attendance`, { headers })
        if (attRes.ok) {
          const aData = await attRes.json()
          setAttendanceData(aData.attendance?.[0] || null)
        }

        // Fetch Marks
        const marksRes = await fetch(`${API_BASE_URL}/student/profile/marks`, { headers })
        if (marksRes.ok) {
          const mData = await marksRes.json()
          setMarksData(mData.marks || [])
        }

        // Fetch Fees
        const feesRes = await fetch(`${API_BASE_URL}/student/profile/fees`, { headers })
        if (feesRes.ok) {
          const fData = await feesRes.json()
          setFeesData(fData)
        }
      } catch (err) {
        console.error('Error loading student portal data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, role])

  const handleLogout = () => {
    try {
      localStorage.clear()
    } catch (e) {}
    window.location.replace('/')
  }

  // Dynamic calculations or fallback values from exact design mockup
  const studentName = profile?.name || localStorage.getItem('studentName') || 'Aditya Kumar'
  const studentFirstName = studentName.split(' ')[0]
  const regNo = profile?.reg_number || localStorage.getItem('studentRollNumber') || '22A51A0501'
  const branchText = profile?.branch || 'Computer Science & Engineering'
  const courseText = profile?.course || 'B.Tech'
  const yearText = profile?.year ? `Semester ${profile.year * 2 - 1}` : 'Semester V'

  // Calculated GPA or default 8.42
  let gpaDisplay = '8.42 / 10'
  if (marksData && marksData.length > 0) {
    let earned = 0
    let totalMax = 0
    marksData.forEach((m) => {
      earned += m.total
      totalMax += (m.internal + m.external) > 100 ? 150 : 100
    })
    const avgPct = totalMax > 0 ? (earned / totalMax) * 100 : 0
    const calcGpa = (avgPct / 10).toFixed(2)
    gpaDisplay = `${calcGpa} / 10`
  }

  // Attendance percentage
  const attendancePct = attendanceData?.percentage
    ? `${attendanceData.percentage}%`
    : '88.5%'

  return (
    <div className="student-portal-wrapper">
      {/* Header */}
      <header className="portal-header">
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => activeTab !== 'dashboard' ? setActiveTab('dashboard') : window.history.back()}
            className="portal-back-btn"
            title="Go Back"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '99px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back
          </button>
          <div className="brand-crest">🎓</div>
          <div className="brand-titles">
            <span className="brand-name-main">AMRITASAI</span>
            <span className="brand-name-sub">INSTITUTE OF SCIENCE & TECHNOLOGY</span>
          </div>
        </div>

        <div className="header-controls">
          <button className="notification-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notification-badge">3</span>
          </button>

          <div
            className="user-profile-capsule"
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
            title="Click student name or icon to view profile"
          >
            <div className="user-avatar-circle">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div
              className="user-meta"
              onClick={(e) => {
                e.stopPropagation()
                setActiveTab('profile')
              }}
              style={{ cursor: 'pointer' }}
            >
              <span
                className="user-name-text"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('profile')
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline decoration-transparent', transition: 'all 0.2s' }}
                title="Click to open Profile"
              >
                {studentName}
              </span>
              <span className="user-reg-text">Reg No: {regNo}</span>
            </div>
          </div>



          <button onClick={handleLogout} className="logout-header-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="portal-body">
        {/* Sidebar Navigation */}
        <aside className="portal-sidebar">
          <div className="sidebar-section-title">MAIN NAVIGATION</div>
          <ul className="sidebar-nav-list">
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="sidebar-item-icon">🏠</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                <span className="sidebar-item-icon">📖</span>
                <span>My Courses</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                <span className="sidebar-item-icon">📅</span>
                <span>Attendance</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'grades' ? 'active' : ''}`}
                onClick={() => setActiveTab('grades')}
              >
                <span className="sidebar-item-icon">🏅</span>
                <span>Grades</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setActiveTab('assignments')}
              >
                <span className="sidebar-item-icon">📝</span>
                <span>Assignments</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'exams' ? 'active' : ''}`}
                onClick={() => setActiveTab('exams')}
              >
                <span className="sidebar-item-icon">🕒</span>
                <span>Exam Schedule</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'fees' ? 'active' : ''}`}
                onClick={() => setActiveTab('fees')}
              >
                <span className="sidebar-item-icon">💳</span>
                <span>Fee Details</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'library' ? 'active' : ''}`}
                onClick={() => setActiveTab('library')}
              >
                <span className="sidebar-item-icon">🔖</span>
                <span>Library</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="sidebar-item-icon">👤</span>
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-item-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <span className="sidebar-item-icon">🤖</span>
                <span>AI Assistant</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className="portal-main-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <section className="welcome-banner">
                <h1 className="welcome-title">Welcome back, {studentFirstName}!</h1>
                <p className="welcome-subtitle">
                  {courseText} {branchText} — {yearText} (Autonomous)
                </p>
              </section>

              {/* 4 Summary Stats Grid */}
              <section className="portal-stats-grid">
                {/* Card 1: CURRENT GPA */}
                <div className="stat-card-item" onClick={() => setActiveTab('grades')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <span className="stat-card-label">CURRENT GPA</span>
                    <div className="stat-icon-badge blue">🎖️</div>
                  </div>
                  <div className="stat-card-value">{gpaDisplay}</div>
                  <div className="stat-card-subtext gold">Top 5% of class cohort</div>
                </div>

                {/* Card 2: ATTENDANCE */}
                <div className="stat-card-item" onClick={() => setActiveTab('attendance')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <span className="stat-card-label">ATTENDANCE</span>
                    <div className="stat-icon-badge blue">📅</div>
                  </div>
                  <div className="stat-card-value">{attendancePct}</div>
                  <div className="stat-card-subtext">Above 75% Requirement</div>
                </div>

                {/* Card 3: ENROLLED COURSES */}
                <div className="stat-card-item" onClick={() => setActiveTab('courses')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <span className="stat-card-label">ENROLLED COURSES</span>
                    <div className="stat-icon-badge blue">📱</div>
                  </div>
                  <div className="stat-card-value">6 Subjects</div>
                  <div className="stat-card-subtext">Include 2 Lab workshops</div>
                </div>

                {/* Card 4: PENDING TASKS */}
                <div className="stat-card-item" onClick={() => setActiveTab('assignments')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-header">
                    <span className="stat-card-label">PENDING TASKS</span>
                    <div className="stat-icon-badge yellow">📄</div>
                  </div>
                  <div className="stat-card-value" style={{ color: '#c05621' }}>
                    3 Assignments
                  </div>
                  <div className="stat-card-subtext orange">Due in the next 4 days</div>
                </div>
              </section>

              {/* Lower Section Grid */}
              <section className="portal-content-grid">
                {/* Today's Classes Card */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">Today's Classes</h2>
                    <span className="portal-card-meta">Monday, Semester V</span>
                  </div>

                  <div className="classes-list">
                    {/* Class 1 (Active Highlighted) */}
                    <div className="class-item-row active">
                      <span className="class-time-pill navy">09:00 - 10:30 AM</span>
                      <div className="class-details">
                        <span className="class-title">Database Management Systems</span>
                        <span className="class-location">CSE Block - LH-302</span>
                      </div>
                    </div>

                    {/* Class 2 */}
                    <div className="class-item-row standard">
                      <span className="class-time-pill gray">10:45 - 12:15 PM</span>
                      <div className="class-details">
                        <span className="class-title">Formal Languages and Automata Theory</span>
                        <span className="class-location">CSE Block - LH-302</span>
                      </div>
                    </div>

                    {/* Class 3 */}
                    <div className="class-item-row standard">
                      <span className="class-time-pill gray">01:30 - 03:00 PM</span>
                      <div className="class-details">
                        <span className="class-title">Web Development Laboratory</span>
                        <span className="class-location">Central Labs - Lab 4</span>
                      </div>
                    </div>

                    {/* Class 4 */}
                    <div className="class-item-row standard">
                      <span className="class-time-pill gray">03:15 - 04:30 PM</span>
                      <div className="class-details">
                        <span className="class-title">Soft Skills & Professional Ethics</span>
                        <span className="class-location">Seminar Hall 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campus Announcements Card */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">Campus Announcements</h2>
                    <span className="portal-card-meta" style={{ fontSize: '18px' }}>📑</span>
                  </div>

                  <div className="announcements-list">
                    {/* Announcement 1 */}
                    <div className="announcement-item-row">
                      <div className="announcement-header-meta">
                        <span className="announcement-tag-badge exams">EXAMS</span>
                        <span className="announcement-date-text">Jan 18, 2026</span>
                      </div>
                      <h3 className="announcement-item-title">
                        Autonomous Semester End Semester V Theory Timetable Released
                      </h3>
                    </div>

                    {/* Announcement 2 */}
                    <div className="announcement-item-row">
                      <div className="announcement-header-meta">
                        <span className="announcement-tag-badge fest">FEST</span>
                        <span className="announcement-date-text">Jan 15, 2026</span>
                      </div>
                      <h3 className="announcement-item-title">
                        Asait'26 - National Level Technical & Cultural Fest Registrations Open
                      </h3>
                    </div>

                    {/* Announcement 3 */}
                    <div className="announcement-item-row">
                      <div className="announcement-header-meta">
                        <span className="announcement-tag-badge library">LIBRARY</span>
                        <span className="announcement-date-text">Jan 10, 2026</span>
                      </div>
                      <h3 className="announcement-item-title">
                        Central Library timings extended till 8:00 PM for semester preparation
                      </h3>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Sub-views for Navigation Options */}
          {activeTab === 'attendance' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 20 }}>Detailed Attendance Records</h2>
              <AttendanceComponent />
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 20 }}>Academic Marks & Performance</h2>
              <MarksComponent />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 16 }}>Enrolled Courses — Semester V</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {[
                  { code: 'CS501', title: 'Database Management Systems', credits: 4, type: 'Theory', lab: 'LH-302' },
                  { code: 'CS502', title: 'Formal Languages & Automata', credits: 3, type: 'Theory', lab: 'LH-302' },
                  { code: 'CS503', title: 'Web Development Laboratory', credits: 2, type: 'Lab Workshop', lab: 'Lab 4' },
                  { code: 'CS504', title: 'Soft Skills & Ethics', credits: 2, type: 'Seminar', lab: 'Hall 1' },
                  { code: 'CS505', title: 'Design & Analysis of Algorithms', credits: 4, type: 'Theory', lab: 'LH-305' },
                  { code: 'CS506', title: 'AI & Machine Learning Lab', credits: 2, type: 'Lab Workshop', lab: 'Lab 2' },
                ].map((c, i) => (
                  <div key={i} style={{ padding: 18, border: '1px solid #e2e8f0', borderRadius: 14, background: '#f8fafc' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>{c.code} • {c.type}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Credits: <strong>{c.credits}</strong> | Room: <strong>{c.lab}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 16 }}>Pending Assignments & Submissions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'DBMS Relational Algebra Problem Set 3', due: 'In 2 days', status: 'Pending', course: 'CS501' },
                  { title: 'FLAT DFA State Minimization Experiment', due: 'In 3 days', status: 'Pending', course: 'CS502' },
                  { title: 'Web Dev Responsive Dashboard Component', due: 'In 4 days', status: 'Pending', course: 'CS503' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>{a.course} • Due: {a.due}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.title}</div>
                    </div>
                    <button style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                      Submit Assignment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 16 }}>Autonomous Semester V Exam Timetable</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: 12 }}>Date</th>
                    <th style={{ padding: 12 }}>Time</th>
                    <th style={{ padding: 12 }}>Subject Code</th>
                    <th style={{ padding: 12 }}>Subject Title</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Feb 10, 2026', time: '10:00 AM - 01:00 PM', code: 'CS501', title: 'Database Management Systems' },
                    { date: 'Feb 12, 2026', time: '10:00 AM - 01:00 PM', code: 'CS502', title: 'Formal Languages and Automata' },
                    { date: 'Feb 14, 2026', time: '10:00 AM - 01:00 PM', code: 'CS505', title: 'Design & Analysis of Algorithms' },
                  ].map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{e.date}</td>
                      <td style={{ padding: 12 }}>{e.time}</td>
                      <td style={{ padding: 12, color: '#2563eb', fontWeight: 700 }}>{e.code}</td>
                      <td style={{ padding: 12 }}>{e.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 16 }}>Fee Details & Account Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ padding: 18, background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TOTAL ACADEMIC FEE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                    ₹{feesData?.total_fee ? feesData.total_fee.toLocaleString('en-IN') : '75,000'}
                  </div>
                </div>
                <div style={{ padding: 18, background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>PAID AMOUNT</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 6 }}>
                    ₹{feesData?.paid_fee ? feesData.paid_fee.toLocaleString('en-IN') : '75,000'}
                  </div>
                </div>
                <div style={{ padding: 18, background: '#fff7ed', borderRadius: 14, border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: 12, color: '#9a3412', fontWeight: 600 }}>PENDING BALANCE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', marginTop: 6 }}>
                    ₹{feesData?.due_fee !== undefined ? feesData.due_fee.toLocaleString('en-IN') : '0'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="portal-card">
              <h2 className="portal-card-title" style={{ marginBottom: 16 }}>Central Library Account</h2>
              <p style={{ color: '#64748b' }}>Books currently issued: <strong>2 Active Books</strong></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                <div style={{ padding: 14, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Database System Concepts (7th Edition) — Silberschatz</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Due Date: Feb 05, 2026 | Barcode: #LIB-983412</div>
                </div>
                <div style={{ padding: 14, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Introduction to Automata Theory, Languages — Hopcroft</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Due Date: Feb 12, 2026 | Barcode: #LIB-884210</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="portal-card">
              <Profile />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="portal-card" style={{ padding: 0, overflow: 'hidden' }}>
              <ChatBox studentName={studentName} embedded={true} />
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Assistant Button */}
      <button
        className="floating-ai-assistant-btn"
        onClick={() => setIsChatOpen((prev) => !prev)}
      >
        <span>🎤</span>
        <span>AI Assistant</span>
      </button>

      {/* ChatBox Overlay */}
      {isChatOpen && (
        <ChatBox
          studentName={studentName}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  )
}
