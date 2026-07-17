import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import FloatingBar from './FloatingBar'
import './StudentPages.css'

export function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [marks, setMarks] = useState([])
  const [fees, setFees] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token || role !== 'student') {
      window.location.replace('/')
      return
    }

    const fetchAllData = async () => {
      try {
        setLoading(true)
        const headers = { Authorization: `Bearer ${token}` }

        // 1. Fetch Profile
        const profileRes = await fetch('http://localhost:8000/student/profile', { headers })
        if (!profileRes.ok) throw new Error('Failed to load profile details')
        const profileData = await profileRes.json()
        setProfile(profileData)

        // 2. Fetch Attendance
        const attendanceRes = await fetch('http://localhost:8000/student/profile/attendance', { headers })
        if (attendanceRes.ok) {
          const attData = await attendanceRes.json()
          setAttendance(attData.attendance?.[0] || null)
        }

        // 3. Fetch Marks
        const marksRes = await fetch('http://localhost:8000/student/profile/marks', { headers })
        if (marksRes.ok) {
          const marksData = await marksRes.json()
          setMarks(marksData.marks || [])
        }

        // 4. Fetch Fees
        const feesRes = await fetch('http://localhost:8000/student/profile/fees', { headers })
        if (feesRes.ok) {
          const feesData = await feesRes.json()
          setFees(feesData)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Unable to connect to the campus API.')
        setLoading(false)
      }
    }

    fetchAllData()
  }, [token, role])

  if (loading) {
    return (
      <div className="student-page">
        <Navbar studentName="Loading..." />
        <div className="status-loading-container">
          <div className="status-spinner" />
          <p>Connecting to Smart Campus Portal...</p>
        </div>
        <FloatingBar />
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-page">
        <Navbar studentName="Error" />
        <div className="status-loading-container">
          <div className="status-error-card">
            <div className="status-error-icon">⚠️</div>
            <div className="status-error-title">Authentication or Server Error</div>
            <p className="status-error-text">{error}</p>
            <button className="student-action-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
        <FloatingBar />
      </div>
    )
  }

  // Calculate summary metrics
  const attendanceVal = attendance ? attendance.percentage : 0
  const attendanceStatus = attendance ? attendance.status : 'No Record'

  let avgMarksPercentage = 0
  let gpaVal = 0
  if (marks && marks.length > 0) {
    let totalEarned = 0
    let totalMax = 0
    marks.forEach(m => {
      totalEarned += m.total
      // Determine if marks are out of 150 (internal max 50 + external max 100) or 100
      const isHighMax = (m.internal + m.external) > 100
      totalMax += isHighMax ? 150 : 100
    })
    avgMarksPercentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 10000) / 100 : 0
    gpaVal = Math.round((avgMarksPercentage / 10) * 100) / 100
  }

  const studentName = profile?.name || profile?.email || 'Student'

  return (
    <div className="student-page">
      <Navbar studentName={studentName} />
      <main className="student-main">
        
        {/* Welcome Section */}
        <section className="student-hero">
          <div className="student-copy">
            <div className="student-badge">Student Workspace</div>
            <h1 className="student-title">Welcome back, {studentName}.</h1>
            <p className="student-text">
              View your academic progress, track attendance logs, clear pending course fee balances, and view announcements below.
            </p>
          </div>

          <aside className="student-panel">
            <div className="student-panel-content">
              <h2 className="student-panel-title">Academic Profile</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Degree & Course</div>
                  <div className="info-value">{profile?.course || 'B.Tech'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Branch/Specialization</div>
                  <div className="info-value">{profile?.branch || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Academic Year</div>
                  <div className="info-value">Year {profile?.year || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Student ID/Roll No</div>
                  <div className="info-value">{profile?.roll_number || `#00${profile?.id || 'N/A'}`}</div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Insights Summary Cards Grid */}
        <section className="stats-summary-grid">
          
          {/* Attendance Card */}
          <div className="stats-card" onClick={() => window.location.href = '/attendance'}>
            <div className="stats-card-header">
              <span className="stats-card-title">Attendance</span>
              <span className="stats-card-icon">📈</span>
            </div>
            <div className="stats-card-body">
              <div className="stats-card-value">{attendanceVal}%</div>
            </div>
            <div className="stats-card-footer">
              <span className={`badge-status ${attendanceStatus.toLowerCase().replace(' ', '')}`}>
                {attendanceStatus}
              </span>
              <span className="stats-card-cta">Details →</span>
            </div>
          </div>

          {/* GPA Card */}
          <div className="stats-card" onClick={() => window.location.href = '/percentage'}>
            <div className="stats-card-header">
              <span className="stats-card-title">Academic Performance</span>
              <span className="stats-card-icon">🎓</span>
            </div>
            <div className="stats-card-body">
              <div className="stats-card-value">{gpaVal > 0 ? `${gpaVal} GPA` : 'N/A'}</div>
            </div>
            <div className="stats-card-footer">
              <span className={`badge-status ${gpaVal >= 7.5 ? 'safe' : gpaVal > 0 ? 'risk' : 'pending'}`}>
                {gpaVal >= 8.5 ? 'Outstanding' : gpaVal >= 7.0 ? 'Good Standing' : gpaVal > 0 ? 'Needs Focus' : 'No Data'}
              </span>
              <span className="stats-card-cta">Grades →</span>
            </div>
          </div>

          {/* Fees Card */}
          <div className="stats-card" style={{ cursor: 'default' }}>
            <div className="stats-card-header">
              <span className="stats-card-title">Pending Balance</span>
              <span className="stats-card-icon">💸</span>
            </div>
            <div className="stats-card-body">
              <div className="stats-card-value">
                {fees?.due_fee !== undefined ? `₹${fees.due_fee.toLocaleString('en-IN')}` : 'N/A'}
              </div>
            </div>
            <div className="stats-card-footer">
              <span className={`badge-status ${fees?.status === 'Paid' ? 'paid' : 'pending'}`}>
                {fees?.status || 'No Records'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                Paid: ₹{fees?.paid_fee?.toLocaleString('en-IN') || 0}
              </span>
            </div>
          </div>

        </section>

        {/* Detailed Profile Summary & Announcements Row */}
        <div className="detail-section-grid">
          
          {/* Announcements Card */}
          <div className="announcements-card">
            <h3 className="announcements-title">
              <span>🔔</span> Campus Announcements
            </h3>
            <div className="announcements-list">
              <div className="announcement-item">
                <div className="announcement-meta">
                  <span className="announcement-date">July 15, 2026</span>
                  <span className="announcement-tag">Academic</span>
                </div>
                <h4 className="announcement-title-text">End Semester Examinations Schedule Out</h4>
                <p className="announcement-body">
                  The examination schedules for B.Tech third-year students are now updated. Check with your departments for lab slots.
                </p>
              </div>

              <div className="announcement-item">
                <div className="announcement-meta">
                  <span className="announcement-date">July 12, 2026</span>
                  <span className="announcement-tag">Notice</span>
                </div>
                <h4 className="announcement-title-text">Course Fee Clearance Deadline Extended</h4>
                <p className="announcement-body">
                  Students with due fees balances can clear payments without fine charges up to the end of next week.
                </p>
              </div>

              <div className="announcement-item">
                <div className="announcement-meta">
                  <span className="announcement-date">July 10, 2026</span>
                  <span className="announcement-tag">AI Assistant</span>
                </div>
                <h4 className="announcement-title-text">Campus AI Assistant Integration Live</h4>
                <p className="announcement-body">
                  Have questions about attendance limits, schedules, or grades? Open the AI assistant from your home screen to resolve queries instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="announcements-card" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="announcements-title">
              <span>👤</span> Contact Information
            </h3>
            <div className="stats-rows" style={{ marginTop: 20 }}>
              <div className="stats-row-item">
                <span className="stats-row-label">Primary Email</span>
                <span className="stats-row-value" style={{ fontSize: '0.95rem' }}>{profile?.email || 'N/A'}</span>
              </div>
            </div>
            <button 
              className="student-action-btn" 
              style={{ width: '100%', marginTop: 24, padding: 14 }}
              onClick={() => window.location.href = '/profile'}
            >
              Update Profile Details
            </button>
          </div>

        </div>

      </main>
      <FloatingBar />
    </div>
  )
}

export function Attendance() {
  const [attendance, setAttendance] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token || role !== 'student') {
      window.location.replace('/')
      return
    }

    const fetchAttendanceData = async () => {
      try {
        setLoading(true)
        const headers = { Authorization: `Bearer ${token}` }

        const profileRes = await fetch('http://localhost:8000/student/profile', { headers })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }

        const attendanceRes = await fetch('http://localhost:8000/student/profile/attendance', { headers })
        if (!attendanceRes.ok) throw new Error('Failed to load student attendance logs')
        const attData = await attendanceRes.json()
        setAttendance(attData.attendance?.[0] || null)

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Unable to fetch attendance.')
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [token, role])

  if (loading) {
    return (
      <div className="student-page">
        <Navbar studentName="Loading..." />
        <div className="status-loading-container">
          <div className="status-spinner" />
          <p>Retrieving your attendance records...</p>
        </div>
        <FloatingBar />
      </div>
    )
  }

  if (error || !attendance) {
    return (
      <div className="student-page">
        <Navbar studentName="Error" />
        <div className="status-loading-container">
          <div className="status-error-card">
            <div className="status-error-icon">📉</div>
            <div className="status-error-title">No Attendance Record Found</div>
            <p className="status-error-text">
              {error || "We couldn't locate any attendance logs for your student ID. Please contact administration."}
            </p>
            <button className="student-action-btn" onClick={() => window.location.href = '/hero'}>Go Back Home</button>
          </div>
        </div>
        <FloatingBar />
      </div>
    )
  }

  const totalDays = attendance.total_days || 0
  const attendedDays = attendance.attended_days || 0
  const absentDays = totalDays - attendedDays
  const percentage = attendance.percentage || 0
  const status = attendance.status || 'At Risk'
  const isSafe = percentage >= 75

  // Calculations for safe margins / actions needed
  let suggestionHeader = ''
  let suggestionBody = ''
  if (percentage < 75) {
    const requiredAtt = Math.ceil(3 * totalDays - 4 * attendedDays)
    suggestionHeader = 'Attendance Shortage Warning'
    suggestionBody = `Your current attendance is below the mandatory 75% requirement. You must attend the next ${requiredAtt} class(es) consecutively to restore your attendance to exactly 75%.`
  } else {
    const missable = Math.floor((4 * attendedDays - 3 * totalDays) / 3)
    suggestionHeader = 'Safe Attendance Standing'
    suggestionBody = missable > 0
      ? `You are meeting the 75% criteria. You can safely miss up to ${missable} class(es) without falling below the 75% limit.`
      : `You are exactly at the 75% limit. Avoid missing any upcoming lectures to maintain eligibility.`
  }

  // Radial calculation (Radius = 70, Circumference = 439.82)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="student-page">
      <Navbar studentName={profile?.name || profile?.email || 'Student'} />
      <main className="student-main">
        
        {/* Welcome Section */}
        <section className="student-hero" style={{ minHeight: 'auto', marginBottom: 32 }}>
          <div className="student-copy">
            <div className="student-badge">Attendance Report</div>
            <h1 className="student-title">Attendance Tracking</h1>
            <p className="student-text">
              View your overall presence summary. Students are required to maintain a minimum of 75% attendance to be eligible for end semester examinations.
            </p>
          </div>
        </section>

        {/* Dynamic Alert Banner */}
        <div className={`info-alert-card ${isSafe ? 'safe' : 'risk'}`}>
          <div className="info-alert-icon">{isSafe ? '✅' : '🚨'}</div>
          <div className="info-alert-content">
            <div className="info-alert-title">{suggestionHeader}</div>
            <div className="info-alert-body">{suggestionBody}</div>
          </div>
        </div>

        {/* Attendance Breakdown Columns */}
        <div className="detail-section-grid" style={{ gridTemplateColumns: '1fr 1.2fr', alignItems: 'center' }}>
          
          {/* Radial visualizer */}
          <div className="radial-progress-container">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="radial-progress-svg">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle className="radial-progress-bg" cx="90" cy="90" r={radius} />
                <circle 
                  className="radial-progress-bar" 
                  cx="90" 
                  cy="90" 
                  r={radius} 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="radial-progress-text">
                <span className="radial-percentage">{percentage}%</span>
                <span className="radial-label">Presence</span>
              </div>
            </div>

            <span className={`badge-status ${status.toLowerCase().replace(' ', '')}`} style={{ marginTop: 8, fontSize: '0.85rem' }}>
              {status}
            </span>
          </div>

          {/* Details list */}
          <div className="announcements-card">
            <h3 className="announcements-title">
              <span>📊</span> Attendance Logs Summary
            </h3>
            <div className="stats-rows" style={{ marginTop: 24 }}>
              <div className="stats-row-item">
                <span className="stats-row-label">Total Conducted Working Days</span>
                <span className="stats-row-value">{totalDays} Days</span>
              </div>
              <div className="stats-row-item">
                <span className="stats-row-label">Attended Classes</span>
                <span className="stats-row-value" style={{ color: '#34d399' }}>{attendedDays} Days</span>
              </div>
              <div className="stats-row-item">
                <span className="stats-row-label">Absent Classes</span>
                <span className="stats-row-value" style={{ color: '#f87171' }}>{absentDays} Days</span>
              </div>
              <div className="stats-row-item">
                <span className="stats-row-label">Official Status</span>
                <span className="stats-row-value">{isSafe ? 'Cleared / Eligible' : 'Shortage Detained'}</span>
              </div>
            </div>
          </div>

        </div>

      </main>
      <FloatingBar />
    </div>
  )
}

export function Percentage() {
  const [marks, setMarks] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token || role !== 'student') {
      window.location.replace('/')
      return
    }

    const fetchAcademicData = async () => {
      try {
        setLoading(true)
        const headers = { Authorization: `Bearer ${token}` }

        const profileRes = await fetch('http://localhost:8000/student/profile', { headers })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }

        const marksRes = await fetch('http://localhost:8000/student/profile/marks', { headers })
        if (!marksRes.ok) throw new Error('Failed to load student academic records')
        const marksData = await marksRes.json()
        setMarks(marksData.marks || [])

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Unable to fetch academic marks.')
        setLoading(false)
      }
    }

    fetchAcademicData()
  }, [token, role])

  if (loading) {
    return (
      <div className="student-page">
        <Navbar studentName="Loading..." />
        <div className="status-loading-container">
          <div className="status-spinner" />
          <p>Calculating grades and fetching semester reports...</p>
        </div>
        <FloatingBar />
      </div>
    )
  }

  if (error || marks.length === 0) {
    return (
      <div className="student-page">
        <Navbar studentName="Error" />
        <div className="status-loading-container">
          <div className="status-error-card">
            <div className="status-error-icon">📖</div>
            <div className="status-error-title">No Academic Marks Found</div>
            <p className="status-error-text">
              {error || "We couldn't locate any grades records for your current semester. Please verify with examination coordinators."}
            </p>
            <button className="student-action-btn" onClick={() => window.location.href = '/hero'}>Go Back Home</button>
          </div>
        </div>
        <FloatingBar />
      </div>
    )
  }

  // Helper to determine Grade letters
  const getGrade = (totalScore, isHighMax) => {
    const percentage = isHighMax ? (totalScore / 150) * 100 : totalScore
    if (percentage >= 90) return { letter: 'O', status: 'pass' }
    if (percentage >= 80) return { letter: 'S', status: 'pass' }
    if (percentage >= 70) return { letter: 'A', status: 'pass' }
    if (percentage >= 60) return { letter: 'B', status: 'pass' }
    if (percentage >= 50) return { letter: 'C', status: 'pass' }
    if (percentage >= 40) return { letter: 'D', status: 'pass' }
    return { letter: 'F', status: 'fail' }
  }

  let totalObtained = 0
  let totalMaxVal = 0
  const processedMarks = marks.map((m) => {
    const isHighMax = (m.internal + m.external) > 100
    const maxVal = isHighMax ? 150 : 100
    totalObtained += m.total
    totalMaxVal += maxVal

    const subPercentage = Math.round((m.total / maxVal) * 10000) / 100
    const gradeObj = getGrade(m.total, isHighMax)

    return {
      ...m,
      maxVal,
      percentage: subPercentage,
      grade: gradeObj.letter,
      gradeStatus: gradeObj.status
    }
  })

  const averagePercentage = totalMaxVal > 0 ? Math.round((totalObtained / totalMaxVal) * 10000) / 100 : 0
  const estimatedGPA = Math.round((averagePercentage / 10) * 100) / 100

  return (
    <div className="student-page">
      <Navbar studentName={profile?.name || profile?.email || 'Student'} />
      <main className="student-main">
        
        {/* Welcome Section */}
        <section className="student-hero" style={{ minHeight: 'auto', marginBottom: 32 }}>
          <div className="student-copy">
            <div className="student-badge">Academic Transcript</div>
            <h1 className="student-title">Academic Records</h1>
            <p className="student-text">
              Track your coursework details, scores in mid-term (Internal) and end-term (External) examinations, and projected GPA rankings.
            </p>
          </div>
        </section>

        {/* Stat Highlights Card */}
        <section className="stats-summary-grid" style={{ marginBottom: 32 }}>
          <div className="stats-card" style={{ minHeight: 140, cursor: 'default' }}>
            <div className="stats-card-header">
              <span className="stats-card-title">Average Percentage</span>
              <span className="stats-card-icon">📈</span>
            </div>
            <div className="stats-card-body" style={{ margin: '8px 0' }}>
              <div className="stats-card-value" style={{ fontSize: '1.9rem' }}>{averagePercentage}%</div>
            </div>
          </div>

          <div className="stats-card" style={{ minHeight: 140, cursor: 'default' }}>
            <div className="stats-card-header">
              <span className="stats-card-title">Semester GPA</span>
              <span className="stats-card-icon">🏆</span>
            </div>
            <div className="stats-card-body" style={{ margin: '8px 0' }}>
              <div className="stats-card-value" style={{ fontSize: '1.9rem' }}>{estimatedGPA} GPA</div>
            </div>
          </div>

          <div className="stats-card" style={{ minHeight: 140, cursor: 'default' }}>
            <div className="stats-card-header">
              <span className="stats-card-title">Total Active Courses</span>
              <span className="stats-card-icon">📚</span>
            </div>
            <div className="stats-card-body" style={{ margin: '8px 0' }}>
              <div className="stats-card-value" style={{ fontSize: '1.9rem' }}>{marks.length} Subjects</div>
            </div>
          </div>
        </section>

        {/* Detailed Marks Table */}
        <div className="table-card" style={{ marginBottom: 32 }}>
          <h3 className="table-title">Subject-Wise Marks Breakdown</h3>
          <div className="table-scroll">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Internal Score</th>
                  <th>External Score</th>
                  <th>Total Secured</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Result Status</th>
                </tr>
              </thead>
              <tbody>
                {processedMarks.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{item.subject}</td>
                    <td>{item.internal} / {item.maxVal === 150 ? 50 : 30}</td>
                    <td>{item.external} / {item.maxVal === 150 ? 100 : 70}</td>
                    <td style={{ fontWeight: 800 }}>{item.total} / {item.maxVal}</td>
                    <td>{item.percentage}%</td>
                    <td style={{ fontWeight: 900, color: item.gradeStatus === 'pass' ? '#34d399' : '#f87171' }}>{item.grade}</td>
                    <td>
                      <span className={`badge-status ${item.gradeStatus}`}>
                        {item.gradeStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject wise progress bars visualizer */}
        <div className="announcements-card">
          <h3 className="announcements-title">
            <span>📊</span> Academic Progress Visualizer
          </h3>
          <div className="subject-progress-grid">
            {processedMarks.map((item, idx) => (
              <div key={idx} className="subject-progress-item">
                <div className="subject-progress-meta">
                  <span className="subject-name">{item.subject}</span>
                  <span className="subject-marks-text">{item.total} / {item.maxVal} ({item.percentage}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <FloatingBar />
    </div>
  )
}
