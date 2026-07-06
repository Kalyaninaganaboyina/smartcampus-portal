import React from 'react'
import Navbar from './Navbar'
import FloatingBar from './FloatingBar'

export function Dashboard() {
  const studentName = localStorage.getItem('studentName') || 'Student'
  return (
    <div>
      <Navbar studentName={studentName} />
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Overview of classes, announcements and quick links.</p>
      </main>
      <FloatingBar />
    </div>
  )
}

export function Attendance() {
  const studentName = localStorage.getItem('studentName') || 'Student'
  return (
    <div>
      <Navbar studentName={studentName} />
      <main style={{ padding: 24 }}>
        <h1>Attendance</h1>
        <p>View attendance records and summaries here.</p>
      </main>
      <FloatingBar />
    </div>
  )
}

export function Percentage() {
  const studentName = localStorage.getItem('studentName') || 'Student'
  return (
    <div>
      <Navbar studentName={studentName} />
      <main style={{ padding: 24 }}>
        <h1>Percentage</h1>
        <p>View academic percentage and grade summaries.</p>
      </main>
      <FloatingBar />
    </div>
  )
}
