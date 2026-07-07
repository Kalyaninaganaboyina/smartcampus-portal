import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Hero from './Hero.jsx'
import Dashboard from './Dashboard.jsx'
import Attendance from './Attendance.jsx'
import Percentage from './Percentage.jsx'
import Faculty from './Faculty.jsx'

const path = window.location.pathname

// Check stored role to auto-redirect returning students
let storedRole = null
try {
  storedRole = localStorage.getItem('role')
} catch (e) {
  storedRole = null
}

let AppRoot = App
if (path === '/hero' || path === '/hero/') AppRoot = Hero
if (path === '/dashboard' || path === '/dashboard/') AppRoot = Dashboard
if (path === '/attendance' || path === '/attendance/') AppRoot = Attendance
if (path === '/percentage' || path === '/percentage/') AppRoot = Percentage
if (path === '/faculty' || path === '/faculty/') AppRoot = Faculty

if (path === '/' || path === '') {
  if (storedRole === 'student') AppRoot = Hero
  if (storedRole === 'faculty') AppRoot = Faculty
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
