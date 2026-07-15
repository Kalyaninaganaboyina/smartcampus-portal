import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import FloatingBar from './FloatingBar'

function Profile() {
  const [profile, setProfile] = useState({
    studentName: 'Student',
    role: 'student',
    email: '',
    branch: '',
    year: '',
    course: '',
    phone: '',
    address: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    const loadProfile = async () => {
      const storedRole = localStorage.getItem('role') || 'student'
      const token = localStorage.getItem('token')
      if (storedRole === 'student' && token) {
        try {
          const response = await fetch('http://localhost:8000/student/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (!response.ok) throw new Error('Failed to load profile')
          const data = await response.json()
          setProfile({
            studentName: data.name || 'Student',
            role: storedRole,
            email: data.email || '',
            branch: data.branch || '',
            year: data.year?.toString() || '',
            course: data.course || '',
            phone: data.phone_no || '',
            address: data.address || '',
          })
          return
        } catch (error) {
          console.warn('Student profile fetch failed, falling back to local storage', error)
        }
      }

      setProfile({
        studentName: localStorage.getItem('studentName') || 'Student',
        role: storedRole,
        email: localStorage.getItem('studentEmail') || '',
        branch: localStorage.getItem('studentBranch') || '',
        year: localStorage.getItem('studentYear') || '',
        course: localStorage.getItem('studentCourse') || '',
        phone: localStorage.getItem('studentPhone') || '',
        address: localStorage.getItem('studentAddress') || '',
      })
    }

    loadProfile()
  }, [])

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setFeedback('')
  }

  const saveProfileToStorage = (profileData) => {
    localStorage.setItem('studentName', profileData.studentName)
    localStorage.setItem('role', profileData.role)
    localStorage.setItem('studentEmail', profileData.email)
    localStorage.setItem('studentBranch', profileData.branch)
    localStorage.setItem('studentYear', profileData.year)
    localStorage.setItem('studentCourse', profileData.course)
    localStorage.setItem('studentPhone', profileData.phone)
    localStorage.setItem('studentAddress', profileData.address)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('token')

    if (role === 'student' && token) {
      try {
        const response = await fetch('http://localhost:8000/student/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.studentName,
            email: profile.email,
            branch: profile.branch,
            year: profile.year ? Number(profile.year) : undefined,
            course: profile.course,
            phone_no: profile.phone,
            address: profile.address,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'Unable to update profile')
        }

        const updatedProfile = {
          studentName: data.name || profile.studentName,
          role,
          email: data.email || profile.email,
          branch: data.branch || profile.branch,
          year: data.year?.toString() || profile.year,
          course: data.course || profile.course,
          phone: data.phone_no || profile.phone,
          address: data.address || profile.address,
        }
        setProfile(updatedProfile)
        saveProfileToStorage(updatedProfile)
        setFeedback('Profile updated successfully.')
        setEditMode(false)
        return
      } catch (error) {
        setFeedback(error.message || 'Unable to update profile. Please try again.')
        return
      }
    }

    saveProfileToStorage(profile)
    setFeedback('Profile updated successfully.')
    setEditMode(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordFeedback('')

    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      setPasswordFeedback('New password must be at least 6 characters.')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordFeedback('New password and confirmation do not match.')
      return
    }

    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/student/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: passwords.current,
            new_password: passwords.newPassword,
            confirm_password: passwords.confirmPassword
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'Unable to change password')
        }

        setPasswordFeedback('Password updated successfully.')
        setPasswords({ current: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setPasswordMode(false), 1500)
        return
      } catch (error) {
        setPasswordFeedback(error.message || 'Unable to change password. Please try again.')
        return
      }
    }

    // Fallback for mocked mode
    const savedPassword = localStorage.getItem('studentPassword') || ''
    if (savedPassword && passwords.current !== savedPassword) {
      setPasswordFeedback('Current password does not match.')
      return
    }
    localStorage.setItem('studentPassword', passwords.newPassword)
    setPasswords({ current: '', newPassword: '', confirmPassword: '' })
    setPasswordFeedback('Password updated successfully.')
    setPasswordMode(false)
  }

  const formField = (label, key, type = 'text', placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{ marginBottom: 8, color: '#334155', fontWeight: 700 }}>{label}</div>
      <input
        type={type}
        value={profile[key]}
        placeholder={placeholder}
        disabled={!editMode}
        onChange={(e) => handleChange(key, e.target.value)}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 14,
          border: '1px solid #cbd5e1',
          background: editMode ? '#fff' : '#f8fafc',
          color: '#0f172a'
        }}
      />
    </label>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#eff6ff', paddingBottom: 120 }}>
      <Navbar role={profile.role} studentName={profile.studentName} />
      <main style={{ padding: '100px 24px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 24 }}>
          <section style={{ background: '#fff', borderRadius: 28, padding: 28, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Profile</h1>
                <p style={{ margin: '10px 0 0', color: '#64748b' }}>Edit your contact details and update your password here.</p>
              </div>
              <button
                type="button"
                onClick={() => { setEditMode((prev) => !prev); setFeedback('') }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 16,
                  border: 'none',
                  background: editMode ? '#f8fafc' : '#2563eb',
                  color: editMode ? '#0f172a' : '#fff',
                  cursor: 'pointer'
                }}
              >
                {editMode ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            <form onSubmit={handleSave} style={{ marginTop: 28, display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {formField('Full Name', 'studentName', 'text', 'Enter your name')}
                {formField('Email', 'email', 'email', 'name@example.com')}
                {formField('Phone', 'phone', 'tel', '123-456-7890')}
                {formField('Branch', 'branch', 'text', 'Computer Science')}
                {formField('Year', 'year', 'number', '2')}
                {formField('Course', 'course', 'text', 'B.Tech')}
              </div>
              <label style={{ display: 'block', marginBottom: 16 }}>
                <div style={{ marginBottom: 8, color: '#334155', fontWeight: 700 }}>Address</div>
                <textarea
                  value={profile.address}
                  disabled={!editMode}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter your address"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid #cbd5e1',
                    background: editMode ? '#fff' : '#f8fafc',
                    color: '#0f172a',
                    resize: 'vertical'
                  }}
                />
              </label>
              {feedback && (
                <div style={{ padding: 16, borderRadius: 16, background: '#ecfdf5', color: '#166534', border: '1px solid #d1fae5' }}>
                  {feedback}
                </div>
              )}
              {editMode && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <button type="submit" style={{ padding: '12px 20px', borderRadius: 16, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Save changes</button>
                  <button type="button" onClick={() => setEditMode(false)} style={{ padding: '12px 20px', borderRadius: 16, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </form>
          </section>

          <section style={{ background: '#fff', borderRadius: 28, padding: 28, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Change Password</h2>
                <p style={{ margin: '10px 0 0', color: '#64748b' }}>Secure your account with a new password.</p>
              </div>
              <button
                type="button"
                onClick={() => { setPasswordMode((prev) => !prev); setPasswordFeedback(''); setPasswords({ current:'', newPassword:'', confirmPassword:''}) }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 16,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {passwordMode ? 'Hide Password Form' : 'Change Password'}
              </button>
            </div>

            {passwordMode && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: 24, display: 'grid', gap: 16, maxWidth: 520 }}>
                <label style={{ display: 'block' }}>
                  <div style={{ marginBottom: 8, color: '#334155', fontWeight: 700 }}>Current Password</div>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                    placeholder="Enter current password"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <div style={{ marginBottom: 8, color: '#334155', fontWeight: 700 }}>New Password</div>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Create a new password"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <div style={{ marginBottom: 8, color: '#334155', fontWeight: 700 }}>Confirm Password</div>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }}
                  />
                </label>
                {passwordFeedback && (
                  <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', color: passwordFeedback.includes('successfully') ? '#166534' : '#b91c1c', border: passwordFeedback.includes('successfully') ? '1px solid #d1fae5' : '1px solid #fecaca' }}>
                    {passwordFeedback}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button type="submit" style={{ padding: '12px 20px', borderRadius: 16, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Update password</button>
                  <button type="button" onClick={() => setPasswordMode(false)} style={{ padding: '12px 20px', borderRadius: 16, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
      <FloatingBar />
    </div>
  )
}

export default Profile
