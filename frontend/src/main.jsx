import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Hero from './Hero.jsx'
import Dashboard from './Dashboard.jsx'
import Attendance from './Attendance.jsx'
import Percentage from './Percentage.jsx'
import Faculty from './Faculty.jsx'
import Admin from './Admin.jsx'
import Profile from './Profile.jsx'

const path = window.location.pathname

// Check stored role to auto-redirect returning users
let storedRole = null
try {
  storedRole = localStorage.getItem('role')
} catch (e) {
  storedRole = null
}

let AppRoot = App
let initialRole = null
if (path === '/hero' || path === '/hero/') AppRoot = Hero
if (path === '/dashboard' || path === '/dashboard/') AppRoot = Dashboard
if (path === '/attendance' || path === '/attendance/') AppRoot = Attendance
if (path === '/percentage' || path === '/percentage/') AppRoot = Percentage
if (path === '/faculty' || path === '/faculty/') AppRoot = Faculty
if (path === '/admin' || path === '/admin/') {
  if (storedRole === 'admin') {
    AppRoot = Admin
  } else {
    AppRoot = App
    initialRole = 'admin'
  }
}
if (path === '/profile' || path === '/profile/') AppRoot = Profile

if (path === '/' || path === '') {
  if (storedRole === 'student') AppRoot = Hero
  if (storedRole === 'faculty') AppRoot = Faculty
  if (storedRole === 'admin') AppRoot = Admin
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot initialRole={initialRole} />
  </StrictMode>,
)
