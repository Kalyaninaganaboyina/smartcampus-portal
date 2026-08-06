import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import FloatingBar from './FloatingBar'
import './Admin.css'
import { API_BASE_URL } from './config'

function Admin() {
  const role = localStorage.getItem('role')
  const userName = localStorage.getItem('studentName') || 'Admin'
  const [activeTab, setActiveTab] = useState('marks')
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  // Registered students list state
  const [students, setStudents] = useState([])
  const [isStudentsLoading, setIsStudentsLoading] = useState(false)

  // Faculty list state
  const [faculty, setFaculty] = useState([])
  const [isFacultyLoading, setIsFacultyLoading] = useState(false)

  // Search state
  const [searchStudentQuery, setSearchStudentQuery] = useState('')
  const [searchFacultyQuery, setSearchFacultyQuery] = useState('')

  // Modal / Form state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [isEditingFaculty, setIsEditingFaculty] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editingFacultyId, setEditingFacultyId] = useState(null)

  // Student Form fields
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    year: 1,
    course: 'B.Tech',
    phone_no: '',
    address: ''
  })

  // Faculty Form fields
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    designation: 'Assistant Professor',
    phone_no: '',
    address: ''
  })

  useEffect(() => {
    if (role !== 'admin') {
      window.location.replace('/')
    } else {
      fetchStudents()
      fetchFaculty()
    }
  }, [role])

  const handleAuthError = (res) => {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('studentName')
      window.location.replace('/admin')
      return true
    }
    return false
  }

  const fetchStudents = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setIsStudentsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (handleAuthError(response)) return
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (e) {
      console.error("Error fetching students list", e)
    } finally {
      setIsStudentsLoading(false)
    }
  }

  // Delete all students, marks, attendance, fees, PDFs
  const handleDeleteAllStudents = async () => {
    if (!window.confirm('This will permanently delete ALL student records, marks, attendance, fees, and PDFs. Continue?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      alert(data.message);
      fetchStudents();
    } catch (e) {
      alert('Failed to delete all students: ' + e.message);
    }
  };

  const fetchFaculty = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setIsFacultyLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (handleAuthError(response)) return
      if (response.ok) {
        const data = await response.json()
        setFaculty(data)
      }
    } catch (e) {
      console.error("Error fetching faculty list", e)
    } finally {
      setIsFacultyLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setIsAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (handleAuthError(response)) return
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail || 'Failed to fetch analytics statistics')
      }
    } catch (e) {
      console.error("Error fetching analytics stats", e)
      setAnalyticsError(e.message || 'Error connecting to analytics endpoint')
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    setFile(selectedFile || null)
    setFileName(selectedFile ? selectedFile.name : '')
    setMessage('')
  }

  const handleUpload = async (tab) => {
    if (!file) return
    setMessage('')
    setIsUploading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      setMessage('Admin is not authenticated. Please log in again.')
      setIsUploading(false)
      return
    }

    const endpoint = `${API_BASE_URL}/admin/upload-${tab}`
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (handleAuthError(response)) return

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed. Please check the file and try again.')
      }

      setMessage(data.message || `${tab.charAt(0).toUpperCase() + tab.slice(1)} uploaded successfully.`)
      setFile(null)
      setFileName('')

      // Refresh students table if uploading a student
      if (tab === 'student-pdf') {
        fetchStudents()
      }
    } catch (error) {
      setMessage(error.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target
    setStudentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFacultyFormChange = (e) => {
    const { name, value } = e.target
    setFacultyForm(prev => ({ ...prev, [name]: value }))
  }

  const openAddStudentModal = () => {
    setStudentForm({
      name: '',
      email: '',
      password: '',
      branch: 'CSE',
      year: 1,
      course: 'B.Tech',
      phone_no: '',
      address: ''
    })
    setIsEditingStudent(false)
    setEditingStudentId(null)
    setIsStudentModalOpen(true)
  }

  const openEditStudentModal = (student) => {
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
      branch: student.branch || '',
      year: student.year || 1,
      course: student.course || '',
      phone_no: student.phone_no || '',
      address: student.address || ''
    })
    setIsEditingStudent(true)
    setEditingStudentId(student.id)
    setIsStudentModalOpen(true)
  }

  const openAddFacultyModal = () => {
    setFacultyForm({
      name: '',
      email: '',
      password: '',
      department: 'CSE',
      designation: 'Assistant Professor',
      phone_no: '',
      address: ''
    })
    setIsEditingFaculty(false)
    setEditingFacultyId(null)
    setIsFacultyModalOpen(true)
  }

  const openEditFacultyModal = (fac) => {
    setFacultyForm({
      name: fac.name || '',
      email: fac.email || '',
      password: '',
      department: fac.department || '',
      designation: fac.designation || '',
      phone_no: fac.phone_no || '',
      address: fac.address || ''
    })
    setIsEditingFaculty(true)
    setEditingFacultyId(fac.id)
    setIsFacultyModalOpen(true)
  }

  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    const endpoint = isEditingStudent
      ? `${API_BASE_URL}/admin/students/${editingStudentId}`
      : `${API_BASE_URL}/admin/students`

    const method = isEditingStudent ? 'PUT' : 'POST'

    const bodyObj = { ...studentForm }
    if (isEditingStudent && !bodyObj.password) {
      delete bodyObj.password
    }
    bodyObj.year = parseInt(bodyObj.year) || 1

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyObj)
      })

      if (handleAuthError(response)) return

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save student details')
      }

      setMessage(isEditingStudent ? 'Student details updated successfully.' : 'Student created successfully.')
      setIsStudentModalOpen(false)
      fetchStudents()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleFacultySubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    const endpoint = isEditingFaculty
      ? `${API_BASE_URL}/admin/faculty/${editingFacultyId}`
      : `${API_BASE_URL}/admin/faculty`

    const method = isEditingFaculty ? 'PUT' : 'POST'

    const bodyObj = { ...facultyForm }
    if (isEditingFaculty && !bodyObj.password) {
      delete bodyObj.password
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyObj)
      })

      if (handleAuthError(response)) return

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save faculty details')
      }

      setMessage(isEditingFaculty ? 'Faculty details updated successfully.' : 'Faculty member created successfully.')
      setIsFacultyModalOpen(false)
      fetchFaculty()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleStudentDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? All their marks, attendance, fee records will also be deleted.")) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (handleAuthError(response)) return

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete student')
      }

      setMessage('Student deleted successfully.')
      fetchStudents()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleFacultyDelete = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/faculty/${facultyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (handleAuthError(response)) return

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete faculty')
      }

      setMessage('Faculty member deleted successfully.')
      fetchFaculty()
    } catch (error) {
      alert(error.message)
    }
  }

  if (role !== 'admin') {
    return (
      <div className="admin-page">
        <main className="admin-main">
          <div className="admin-unauthorized">
            <h2>Unauthorized</h2>
            <p>Only authorized admin users can access this page. Redirecting to login...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Navbar role="admin" studentName={userName} />
      <main className="admin-main">
        <section className="admin-hero">
          <div className="admin-copy">
            <div className="admin-badge">Admin Portal</div>
            <h1 className="admin-title">Welcome back, {userName}.</h1>
            <p className="admin-text">
              Manage student registrations, upload marks, attendance reports, and academic status from one place.
            </p>
            <div className="admin-actions">
              <button className={`admin-btn ${activeTab === 'marks' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('marks'); setMessage(''); }}>Upload Marks</button>
              <button className={`admin-btn ${activeTab === 'attendance' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('attendance'); setMessage(''); }}>Upload Attendance</button>
              <button className={`admin-btn ${activeTab === 'fees' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('fees'); setMessage(''); }}>Upload Fees</button>
              <button className={`admin-btn ${activeTab === 'student-pdf' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('student-pdf'); setMessage(''); }}>Add Student (PDF)</button>
              <button className={`admin-btn ${activeTab === 'students' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('students'); fetchStudents(); setMessage(''); }}>Manage Students</button>
              <button className={`admin-btn ${activeTab === 'faculty' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('faculty'); fetchFaculty(); setMessage(''); }}>Manage Faculty</button>
              <button className={`admin-btn ${activeTab === 'analytics' ? 'active' : ''}`} type="button" onClick={() => { setActiveTab('analytics'); fetchAnalytics(); setMessage(''); }}>Track & Analyze</button>
            </div>
          </div>

          <aside className="admin-panel">
            <div className="admin-panel-content">
              <h2 className="admin-panel-title">Admin Tools</h2>
              <p className="admin-panel-text">Select a data category to upload latest files directly to the server database.</p>

              <div className="admin-status">
                <div className="admin-status-label">Active Option</div>
                <div className="admin-status-value">
                  {activeTab === 'student-pdf' ? 'Add Student (PDF)' : activeTab === 'analytics' ? 'Track & Analyze' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </div>
              </div>

              <div className="admin-panel-note">
                {activeTab === 'analytics' ? 'View and analyze real-time student grades, attendance, and fee collections.' : 'Ensure files match target format. PDF details will be parsed intelligently.'}
              </div>
            </div>
          </aside>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-card" id="marks" style={{ display: activeTab === 'marks' ? 'block' : 'none' }}>
            <h3>Upload Marks CSV</h3>
            <p>Required columns: <strong>student_id, subject, internal_marks, external_marks</strong></p>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button type="button" className="admin-form-btn" onClick={() => handleUpload('marks')} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload marks'}
            </button>
          </div>

          <div className="admin-form-card" id="attendance" style={{ display: activeTab === 'attendance' ? 'block' : 'none' }}>
            <h3>Upload Attendance CSV</h3>
            <p>Required columns: <strong>student_id, total_days, attended_days, absent_days</strong></p>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button type="button" className="admin-form-btn" onClick={() => handleUpload('attendance')} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload attendance'}
            </button>
          </div>

          <div className="admin-form-card" id="fees" style={{ display: activeTab === 'fees' ? 'block' : 'none' }}>
            <h3>Upload Fees CSV</h3>
            <p>Required columns: <strong>student_id, total_fee, paid_fee, due_fee</strong></p>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button type="button" className="admin-form-btn" onClick={() => handleUpload('fees')} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload fees'}
            </button>
          </div>

          <div className="admin-form-card" id="student-pdf" style={{ display: activeTab === 'student-pdf' ? 'block' : 'none' }}>
            <h3>Add Student from Bio PDF</h3>
            <p>
              Upload a student info PDF. The system parses details like <strong>Name, Rollnumber, Email, Branch, Year, Course</strong>.
              The student will only be able to login with password <strong>123456789</strong>, which they can later change.
            </p>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button type="button" className="admin-form-btn" onClick={() => handleUpload('student-pdf')} disabled={!file || isUploading}>
              {isUploading ? 'Extracting & Adding...' : 'Upload Student PDF'}
            </button>
          </div>

          {message && <div className="admin-message">{message}</div>}
        </section>

        {/* Manage Students */}
        {activeTab === 'students' && (
          <section className="admin-students-section" style={{ marginTop: '2.5rem' }}>
            <div className="admin-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#102a5f' }}>Manage Students</h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#5f6f8d', fontSize: '0.9rem' }}>Add, update, or remove student accounts</p>
                </div>
                <button type="button" className="admin-form-btn" onClick={openAddStudentModal}>
                  + Add Student
                </button>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Search students by name, email, rollnumber, course or branch..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d9ec',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              {isStudentsLoading ? (
                <p style={{ color: '#5f6f8d' }}>Loading students list...</p>
              ) : students.length === 0 ? (
                <p style={{ color: '#5f6f8d' }}>No students registered yet. Click "+ Add Student" to register one manually.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead className="admin-table-header">
                      <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Branch</th>
                        <th>Year</th>
                        <th className="admin-table-header-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => {
                          const query = searchStudentQuery.toLowerCase()
                          return (
                            (s.name || '').toLowerCase().includes(query) ||
                            (s.email || '').toLowerCase().includes(query) ||
                            (s.branch || '').toLowerCase().includes(query) ||
                            (s.course || '').toLowerCase().includes(query) ||
                            (s.roll_number || '').toLowerCase().includes(query)
                          )
                        })
                        .map((s) => (
                          <tr key={s.id} className="admin-table-row">
                            <td className="admin-table-cell admin-table-cell-roll">{s.roll_number || `#00${s.id}`}</td>
                            <td className="admin-table-cell">{s.name || 'N/A'}</td>
                            <td className="admin-table-cell">{s.email}</td>
                            <td className="admin-table-cell">{s.course}</td>
                            <td className="admin-table-cell">{s.branch}</td>
                            <td className="admin-table-cell">Year {s.year}</td>
                            <td className="admin-table-actions">
                              <button className="admin-action-btn admin-edit-btn" type="button" onClick={() => openEditStudentModal(s)}>
                                Edit
                              </button>
                              <button className="admin-action-btn admin-delete-btn" type="button" onClick={() => handleStudentDelete(s.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}

                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Manage Faculty */}
        {activeTab === 'faculty' && (
          <section className="admin-students-section" style={{ marginTop: '2.5rem' }}>
            <div className="admin-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#102a5f' }}>Manage Faculty</h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#5f6f8d', fontSize: '0.9rem' }}>Add, update, or remove faculty accounts</p>
                </div>
                <button type="button" className="admin-form-btn" onClick={openAddFacultyModal}>
                  + Add Faculty
                </button>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Search faculty by name, email, department or designation..."
                  value={searchFacultyQuery}
                  onChange={(e) => setSearchFacultyQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d9ec',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {isFacultyLoading ? (
                <p style={{ color: '#5f6f8d' }}>Loading faculty list...</p>
              ) : faculty.length === 0 ? (
                <p style={{ color: '#5f6f8d' }}>No faculty registered yet. Click "+ Add Faculty" to register one manually.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #dfe7f4', color: '#102a5f', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Department & Branch</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Designation</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Phone</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculty
                        .filter(f => {
                          const query = searchFacultyQuery.toLowerCase()
                          return (
                            (f.name || '').toLowerCase().includes(query) ||
                            (f.email || '').toLowerCase().includes(query) ||
                            (f.department || '').toLowerCase().includes(query) ||
                            (f.designation || '').toLowerCase().includes(query)
                          )
                        })
                        .map((f) => (
                          <tr key={f.id} style={{ borderBottom: '1px solid #eef3ff', color: '#4e5e7c' }}>
                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#102a5f' }}>{f.name || 'N/A'}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{f.email}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{f.department}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{f.designation || 'N/A'}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{f.phone_no || 'N/A'}</td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => openEditFacultyModal(f)}
                                style={{
                                  background: '#e6f0ff',
                                  color: '#1f4bb8',
                                  border: 'none',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '6px',
                                  marginRight: '0.5rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFacultyDelete(f.id)}
                                style={{
                                  background: '#ffebeb',
                                  color: '#d32f2f',
                                  border: 'none',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Track & Analyze Analytics */}
        {activeTab === 'analytics' && (
          <section className="admin-analytics-section" style={{ marginTop: '2.5rem' }}>
            {isAnalyticsLoading ? (
              <div className="admin-form-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#5f6f8d', fontSize: '1.1rem' }}>Loading campus analytics reports...</p>
              </div>
            ) : analyticsError ? (
              <div className="admin-form-card" style={{ background: '#ffebeb', border: '1px solid #fed7d7' }}>
                <h3 style={{ color: '#c53030', margin: 0 }}>Error Loading Analytics</h3>
                <p style={{ color: '#9b2c2c', margin: '0.5rem 0 1rem' }}>{analyticsError}</p>
                <button type="button" className="admin-form-btn" onClick={fetchAnalytics}>Retry Fetch</button>
              </div>
            ) : analyticsData ? (
              <>
                {/* 1. Metrics Grid */}
                <div className="analytics-metrics-grid">
                  <div className="analytics-card-item">
                    <div className="analytics-card-label">Total Students</div>
                    <div className="analytics-card-value">{analyticsData.total_students}</div>
                    <div className="analytics-card-sub">Registered in portal</div>
                  </div>

                  <div className="analytics-card-item">
                    <div className="analytics-card-label">Total Faculty</div>
                    <div className="analytics-card-value">{analyticsData.total_faculty}</div>
                    <div className="analytics-card-sub">Teaching staff members</div>
                  </div>

                  <div className="analytics-card-item success">
                    <div className="analytics-card-label">Class Attendance</div>
                    <div className="analytics-card-value">{analyticsData.attendance_stats?.average_attendance}%</div>
                    <div className="analytics-card-sub">Overall daily average</div>
                  </div>

                  <div className="analytics-card-item">
                    <div className="analytics-card-label">Average GPA</div>
                    <div className="analytics-card-value">{analyticsData.academic_stats?.average_gpa} GPA</div>
                    <div className="analytics-card-sub">Out of 10.0 scale</div>
                  </div>

                  <div className="analytics-card-item danger">
                    <div className="analytics-card-label">Outstanding Dues</div>
                    <div className="analytics-card-value">₹{analyticsData.fee_stats?.total_due?.toLocaleString('en-IN')}</div>
                    <div className="analytics-card-sub">Total unpaid balances</div>
                  </div>
                </div>

                {/* 2. Visualizers Grid */}
                <div className="analytics-visualizer-grid">
                  {/* Left Column: Attendance and Dues */}
                  <div className="analytics-section-card">
                    <h3 className="analytics-section-title">
                      <span>📈</span> Attendance Distribution
                    </h3>
                    <p className="analytics-section-desc">Comparison of students meeting 75% attendance vs. those at risk</p>
                    
                    {/* SVG Donut Chart */}
                    {(() => {
                      const safeVal = analyticsData.attendance_stats?.safe_count || 0;
                      const riskVal = analyticsData.attendance_stats?.risk_count || 0;
                      const totalVal = safeVal + riskVal;
                      const safePct = totalVal > 0 ? Math.round((safeVal / totalVal) * 100) : 0;

                      // SVG parameters: radius = 50, circumference = 314.16
                      const radius = 50;
                      const circ = 2 * Math.PI * radius;
                      const safeOffset = circ - (safePct / 100) * circ;

                      return (
                        <>
                          <div className="chart-container-center">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#eef3fa" strokeWidth="16" />
                              <circle 
                                cx="70" 
                                cy="70" 
                                r={radius} 
                                fill="transparent" 
                                stroke="#10b981" 
                                strokeWidth="16" 
                                strokeDasharray={circ}
                                strokeDashoffset={safeOffset}
                                strokeLinecap="round"
                                transform="rotate(-90 70 70)"
                              />
                            </svg>
                            <div className="donut-inner-text">
                              <span className="donut-pct">{safePct}%</span>
                              <span className="donut-lbl">Eligible</span>
                            </div>
                          </div>

                          <div className="chart-legend-grid">
                            <div className="legend-item">
                              <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                              <span>Safe (≥75%): {safeVal}</span>
                            </div>
                            <div className="legend-item">
                              <span className="legend-dot" style={{ backgroundColor: '#eef3fa', border: '1px solid #dcdfe6' }}></span>
                              <span>At Risk (&lt;75%): {riskVal}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Attendance Risk warning list */}
                    <div style={{ marginTop: '2rem' }}>
                      <h4 style={{ color: '#102a5f', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Detained / At-Risk Attendance Logs ({analyticsData.attendance_stats?.students_at_risk?.length})</h4>
                      <div className="admin-table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table className="admin-table" style={{ minWidth: '100%' }}>
                          <thead>
                            <tr style={{ background: '#f8fafe' }}>
                              <th style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Roll No</th>
                              <th style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Name</th>
                              <th style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Presence</th>
                              <th style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.attendance_stats?.students_at_risk?.length === 0 ? (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#8fa0be' }}>All students have attendance cleared!</td>
                              </tr>
                            ) : (
                              analyticsData.attendance_stats?.students_at_risk?.map((student, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{student.roll_number || 'N/A'}</td>
                                  <td style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{student.name}</td>
                                  <td style={{ padding: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>{student.percentage}%</td>
                                  <td style={{ padding: '0.5rem' }}>
                                    <span className="badge-danger-custom">Detained</span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Grades and Performance */}
                  <div className="analytics-section-card">
                    <h3 className="analytics-section-title">
                      <span>🎓</span> Academic Grade Distributions
                    </h3>
                    <p className="analytics-section-desc">Breakdown of student academic categories based on GPA results</p>

                    {/* SVG/CSS Bar Chart for Grades */}
                    {(() => {
                      const dist = analyticsData.academic_stats?.grade_distribution || {};
                      const maxCount = Math.max(...Object.values(dist), 1);
                      const grades = ['O', 'S', 'A', 'B', 'C', 'D', 'F'];
                      
                      return (
                        <div className="svg-bar-chart-container">
                          {grades.map((grade) => {
                            const val = dist[grade] || 0;
                            // Calculate height percentage (max height = 150px)
                            const heightPct = Math.max((val / maxCount) * 150, 8); // Minimum 8px for visibility if >0

                            return (
                              <div className="bar-item-col" key={grade}>
                                <div className="bar-tooltip">
                                  {val} Student{val !== 1 ? 's' : ''}
                                </div>
                                <div 
                                  className="bar-graphic" 
                                  style={{ 
                                    height: `${heightPct}px`,
                                    background: grade === 'F' 
                                      ? 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)' 
                                      : 'linear-gradient(180deg, #7c6af7 0%, #1f4bb8 100%)'
                                  }} 
                                />
                                <span className="bar-label">{grade}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Top Performers rankings */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <h4 style={{ color: '#102a5f', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Class Top Performers Leaderboard</h4>
                      <div className="ranking-list-container">
                        {analyticsData.academic_stats?.top_performers?.length === 0 ? (
                          <p style={{ color: '#8fa0be', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No academic logs uploaded yet.</p>
                        ) : (
                          analyticsData.academic_stats?.top_performers?.map((student, idx) => (
                            <div className="ranking-item-row" key={idx}>
                              <div className="ranking-item-left">
                                <span className="ranking-badge-num">{idx + 1}</span>
                                <div className="ranking-item-info">
                                  <span className="ranking-item-name">{student.name}</span>
                                  <span className="ranking-item-roll">{student.roll_number || 'N/A'}</span>
                                </div>
                              </div>
                              <span className="ranking-item-score">{student.gpa} GPA</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Financial/Fee Dues Section */}
                <div className="admin-form-card" style={{ marginBottom: '2.5rem' }}>
                  <h3 className="analytics-section-title">
                    <span>💸</span> Outstanding Tuition Fees Tracker
                  </h3>
                  <p className="analytics-section-desc">Track unpaid academic registration balances and student invoices</p>

                  {(() => {
                    const totalFees = analyticsData.fee_stats?.total_fees || 0;
                    const totalPaid = analyticsData.fee_stats?.total_paid || 0;
                    const totalDue = analyticsData.fee_stats?.total_due || 0;
                    
                    const paidPct = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;
                    const duePct = totalFees > 0 ? (totalDue / totalFees) * 100 : 0;

                    return (
                      <div style={{ margin: '1.5rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#5f6f8d', fontWeight: 600 }}>
                          <span>Fees Received: ₹{totalPaid.toLocaleString('en-IN')} ({Math.round(paidPct)}%)</span>
                          <span>Unpaid Balances: ₹{totalDue.toLocaleString('en-IN')} ({Math.round(duePct)}%)</span>
                        </div>
                        <div className="financials-progress-track">
                          <div className="financials-progress-fill" style={{ width: `${paidPct}%` }} />
                          <div className="financials-progress-due" style={{ width: `${duePct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dues table list */}
                  <h4 style={{ color: '#102a5f', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Students with Unpaid Dues ({analyticsData.fee_stats?.students_with_dues?.length})</h4>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead className="admin-table-header">
                        <tr>
                          <th>Roll Number</th>
                          <th>Name</th>
                          <th>Email Address</th>
                          <th>Total Billed</th>
                          <th>Paid Amount</th>
                          <th>Remaining Due</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.fee_stats?.students_with_dues?.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: '#8fa0be', padding: '1.5rem' }}>Outstanding balances cleared for all students!</td>
                          </tr>
                        ) : (
                          analyticsData.fee_stats?.students_with_dues?.map((student, idx) => (
                            <tr key={idx} className="admin-table-row">
                              <td className="admin-table-cell-roll">{student.roll_number || 'N/A'}</td>
                              <td className="admin-table-cell">{student.name}</td>
                              <td className="admin-table-cell">{student.email}</td>
                              <td className="admin-table-cell">₹{student.total_fee.toLocaleString('en-IN')}</td>
                              <td className="admin-table-cell" style={{ color: '#10b981', fontWeight: 600 }}>₹{student.paid_fee.toLocaleString('en-IN')}</td>
                              <td className="admin-table-cell" style={{ color: '#ef4444', fontWeight: 800 }}>₹{student.due_fee.toLocaleString('en-IN')}</td>
                              <td className="admin-table-cell">
                                <a 
                                  href={`mailto:${student.email}?subject=Urgent: Outstanding Tuition Fee Dues Notice&body=Dear ${student.name},%0D%0A%0D%0AThis is to notify you that your Smart Campus portal shows an outstanding fee balance of INR ${student.due_fee.toLocaleString('en-IN')} out of your total billed amount of INR ${student.total_fee.toLocaleString('en-IN')}.%0D%0A%0D%0APlease clear your dues at the earliest convenience.%0D%0A%0D%0ABest regards,%0D%0AAdministration Office`}
                                  className="admin-form-btn" 
                                  style={{ 
                                    padding: '0.4rem 0.8rem', 
                                    fontSize: '0.8rem', 
                                    textDecoration: 'none',
                                    backgroundColor: '#d32f2f',
                                    borderRadius: '8px'
                                  }}
                                >
                                  📧 Send Notice
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        {/* Registered Students Summary List */}
        {activeTab !== 'students' && activeTab !== 'faculty' && activeTab !== 'analytics' && (
          <section className="admin-students-section" style={{ marginTop: '2.5rem' }}>
            <div className="admin-form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#102a5f' }}>Registered Students Summary</h3>
                <button
                  onClick={fetchStudents}
                  className="admin-form-btn"
                  style={{ background: '#e6f0ff', color: '#1f4bb8', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  Refresh List
                </button>
                <button
                  onClick={handleDeleteAllStudents}
                  className="admin-form-btn"
                  style={{ background: '#ff4d4d', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600, marginLeft: '0.5rem' }}
                >
                  Remove All Students
                </button>
              </div>

              {isStudentsLoading ? (
                <p style={{ color: '#5f6f8d' }}>Loading students list...</p>
              ) : students.length === 0 ? (
                <p style={{ color: '#5f6f8d' }}>No students registered yet. Upload a student PDF above to get started.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #dfe7f4', color: '#102a5f', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Roll Number</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Course</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Branch</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #eef3ff', color: '#4e5e7c' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#102a5f' }}>{student.roll_number || `#00${student.id}`}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{student.name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{student.email}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{student.course}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{student.branch}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>Year {student.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Student Modal */}
      {isStudentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 42, 95, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#102a5f' }}>{isEditingStudent ? 'Edit Student Details' : 'Add New Student'}</h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5f6f8d'
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="admin-input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="admin-input-group" style={{ gridColumn: 'span 2' }}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="admin-input-field"
                  value={studentForm.name}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="admin-input-field"
                  value={studentForm.email}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Password {isEditingStudent && "(Leave blank to keep current)"}</label>
                <input
                  type="password"
                  name="password"
                  required={!isEditingStudent}
                  className="admin-input-field"
                  value={studentForm.password}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Course</label>
                <input
                  type="text"
                  name="course"
                  className="admin-input-field"
                  value={studentForm.course}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Branch / Specialization</label>
                <input
                  type="text"
                  name="branch"
                  className="admin-input-field"
                  value={studentForm.branch}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Year of Study</label>
                <select
                  name="year"
                  className="admin-input-field"
                  value={studentForm.year}
                  onChange={handleStudentFormChange}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="admin-input-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  className="admin-input-field"
                  value={studentForm.phone_no}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div className="admin-input-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <textarea
                  name="address"
                  className="admin-input-field"
                  style={{ minHeight: '80px', fontFamily: 'inherit' }}
                  value={studentForm.address}
                  onChange={handleStudentFormChange}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  style={{
                    background: '#f0f4fc',
                    color: '#5f6f8d',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-form-btn"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {isEditingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Modal */}
      {isFacultyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 42, 95, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#102a5f' }}>{isEditingFaculty ? 'Edit Faculty Details' : 'Add New Faculty'}</h3>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5f6f8d'
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFacultySubmit} className="admin-input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="admin-input-group" style={{ gridColumn: 'span 2' }}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="admin-input-field"
                  value={facultyForm.name}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="admin-input-field"
                  value={facultyForm.email}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Password {isEditingFaculty && "(Leave blank to keep current)"}</label>
                <input
                  type="password"
                  name="password"
                  required={!isEditingFaculty}
                  className="admin-input-field"
                  value={facultyForm.password}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  required
                  className="admin-input-field"
                  value={facultyForm.department}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="admin-input-field"
                  value={facultyForm.designation}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  className="admin-input-field"
                  value={facultyForm.phone_no}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div className="admin-input-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <textarea
                  name="address"
                  className="admin-input-field"
                  style={{ minHeight: '80px', fontFamily: 'inherit' }}
                  value={facultyForm.address}
                  onChange={handleFacultyFormChange}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  style={{
                    background: '#f0f4fc',
                    color: '#5f6f8d',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-form-btn"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {isEditingFaculty ? 'Save Changes' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

