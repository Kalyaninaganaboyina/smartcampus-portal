import React, { useState, useEffect, useRef } from 'react'
import './ChatBox.css'
import { API_BASE_URL } from './config'

/* -------------------------------------------------------------------------
   Gemini Sparkle Icon
------------------------------------------------------------------------- */
function GeminiSparkleIcon({ size = 24, className = "" }) {
  return (
    <svg className={`gemini-sparkle-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="url(#gemini-grad)" />
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* -------------------------------------------------------------------------
   Typewriter Text Component
------------------------------------------------------------------------- */
function TypewriterText({ text, speed = 18, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayedText('')
    indexRef.current = 0
    if (!text) return

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current))
        indexRef.current += 1
      } else {
        clearInterval(timer)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <span>{displayedText}</span>
}

/* -------------------------------------------------------------------------
   Graphical Render Widgets (Donut charts, Bar charts, Stat Cards)
------------------------------------------------------------------------- */
function RenderWidget({ widget }) {
  if (!widget || !widget.type) return null

  // 1. ATTENDANCE DONUT CHART WIDGET
  if (widget.type === 'attendance') {
    const { total_days = 0, attended_days = 0, percentage = 0, status = 'Safe' } = widget.data || {}
    const isSafe = status?.toLowerCase().includes('safe')
    const radius = 36
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference

    return (
      <div className="chat-widget-card widget-attendance-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <span className="widget-icon">📊</span>
            <div>
              <div className="widget-main-title">{widget.title || 'Attendance Overview'}</div>
              <div className="widget-subtitle">Academic Year 2025 - 2026</div>
            </div>
          </div>
          <span className={`widget-status-badge ${isSafe ? 'safe' : 'risk'}`}>
            {status}
          </span>
        </div>

        <div className="attendance-chart-layout">
          {/* Donut Ring Chart */}
          <div className="donut-chart-container">
            <svg width="100" height="100" viewBox="0 0 100 100" className="donut-svg">
              <circle cx="50" cy="50" r={radius} className="donut-bg-ring" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`donut-fill-ring ${isSafe ? 'safe' : 'risk'}`}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="donut-center-text">
              <span className="pct-val">{percentage}%</span>
              <span className="pct-label">Attended</span>
            </div>
          </div>

          <div className="attendance-stats-column">
            <div className="stat-row">
              <span className="stat-dot total"></span>
              <span className="stat-name">Total Conducted:</span>
              <span className="stat-value">{total_days} Days</span>
            </div>
            <div className="stat-row">
              <span className="stat-dot attended"></span>
              <span className="stat-name">Attended:</span>
              <span className="stat-value highlight">{attended_days} Days</span>
            </div>
            <div className="stat-row">
              <span className="stat-dot absent"></span>
              <span className="stat-name">Absent:</span>
              <span className="stat-value">{Math.max(0, total_days - attended_days)} Days</span>
            </div>
            <div className="attendance-requirement-note">
              ℹ Minimum 75% required to sit for examinations.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. MARKS BAR CHART WIDGET
  if (widget.type === 'marks') {
    const { gpa = 0.0, items = [] } = widget.data || {}
    return (
      <div className="chat-widget-card widget-marks-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <span className="widget-icon">🏅</span>
            <div>
              <div className="widget-main-title">{widget.title || 'Academic Performance'}</div>
              <div className="widget-subtitle">Semester Grades & Subject Breakdown</div>
            </div>
          </div>
          <div className="gpa-pill-badge">
            <span>Cumulative GPA</span>
            <strong>{gpa} / 10</strong>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="widget-empty-msg">No mark records found for this student.</div>
        ) : (
          <div className="marks-bars-list">
            {items.map((m, idx) => {
              const maxVal = m.max || 100
              const pct = Math.min(100, Math.round((m.total / maxVal) * 100))
              return (
                <div key={idx} className="mark-bar-row">
                  <div className="mark-label-line">
                    <span className="subject-name">{m.subject}</span>
                    <div className="mark-nums">
                      <span className="score-text">{m.total} / {maxVal}</span>
                      {m.grade && <span className={`grade-tag grade-${m.grade}`}>{m.grade}</span>}
                    </div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mark-sub-details">
                    <span>Internal: {m.internal}</span>
                    <span>External: {m.external}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // 3. FEE BREAKDOWN WIDGET
  if (widget.type === 'fees') {
    const { total_fee = 0, paid_fee = 0, due_fee = 0, status = 'Paid' } = widget.data || {}
    const isPaid = due_fee <= 0 || status.toLowerCase().includes('paid')
    const paidPct = total_fee > 0 ? Math.min(100, Math.round((paid_fee / total_fee) * 100)) : 100

    return (
      <div className="chat-widget-card widget-fees-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <span className="widget-icon">💳</span>
            <div>
              <div className="widget-main-title">{widget.title || 'Semester Fee Dues'}</div>
              <div className="widget-subtitle">Tuition & Administrative Dues</div>
            </div>
          </div>
          <span className={`widget-status-badge ${isPaid ? 'safe' : 'risk'}`}>
            {isPaid ? 'Cleared' : 'Pending Dues'}
          </span>
        </div>

        <div className="fee-summary-visual">
          <div className="fee-progress-line">
            <div className="fee-progress-label">
              <span>Paid Status</span>
              <strong>{paidPct}% Completed</strong>
            </div>
            <div className="bar-track">
              <div className="bar-fill fee" style={{ width: `${paidPct}%` }} />
            </div>
          </div>

          <div className="fee-cards-grid">
            <div className="fee-card-box">
              <span className="box-title">TOTAL FEE</span>
              <span className="box-amount">₹{total_fee.toLocaleString('en-IN')}</span>
            </div>
            <div className="fee-card-box paid">
              <span className="box-title">PAID AMOUNT</span>
              <span className="box-amount text-success">₹{paid_fee.toLocaleString('en-IN')}</span>
            </div>
            <div className="fee-card-box due">
              <span className="box-title">REMAINING DUE</span>
              <span className="box-amount text-warning">₹{due_fee.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. OVERALL PERFORMANCE DASHBOARD WIDGET
  if (widget.type === 'performance') {
    const { gpa = 0, attendance_pct = 0, attendance_status = 'Safe', due_fee = 0, fee_status = 'Paid', subjects_count = 0 } = widget.data || {}
    const isAttSafe = attendance_status.toLowerCase().includes('safe')
    const isFeeCleared = due_fee <= 0

    return (
      <div className="chat-widget-card widget-performance-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <span className="widget-icon">🚀</span>
            <div>
              <div className="widget-main-title">{widget.title || 'Academic Performance Overview'}</div>
              <div className="widget-subtitle">Comprehensive Student Health Scorecard</div>
            </div>
          </div>
        </div>

        <div className="performance-grid">
          <div className="perf-metric-box">
            <span className="perf-icon">🎓</span>
            <div className="perf-info">
              <span className="perf-value">{gpa} / 10</span>
              <span className="perf-label">Cumulative GPA ({subjects_count} Subjects)</span>
            </div>
          </div>

          <div className="perf-metric-box">
            <span className="perf-icon">📊</span>
            <div className="perf-info">
              <span className="perf-value">{attendance_pct}%</span>
              <span className={`perf-subbadge ${isAttSafe ? 'safe' : 'risk'}`}>{attendance_status}</span>
            </div>
          </div>

          <div className="perf-metric-box">
            <span className="perf-icon">💳</span>
            <div className="perf-info">
              <span className="perf-value">₹{due_fee.toLocaleString('en-IN')}</span>
              <span className={`perf-subbadge ${isFeeCleared ? 'safe' : 'risk'}`}>{fee_status}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 5. PROFILE REGISTRATION CARD WIDGET
  if (widget.type === 'profile') {
    const { name, reg_number, branch, course, year } = widget.data || {}
    return (
      <div className="chat-widget-card widget-profile-card">
        <div className="profile-id-badge">
          <div className="profile-avatar-wrapper">
            <div className="avatar-circle-large">{name ? name.charAt(0).toUpperCase() : 'S'}</div>
          </div>
          <div className="profile-details-column">
            <h4 className="student-name">{name || 'Student Name'}</h4>
            <span className="roll-pill">REG NO: {reg_number}</span>
            <div className="program-info">
              <span>{course}</span> • <span>{branch}</span>
            </div>
            <span className="year-tag">Year {year} • Academic Record Active</span>
          </div>
        </div>
      </div>
    )
  }

  // 6. CLASS TIMETABLE WIDGET
  if (widget.type === 'classes') {
    const { items = [] } = widget.data || {}
    return (
      <div className="chat-widget-card widget-classes-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <span className="widget-icon">🕒</span>
            <div>
              <div className="widget-main-title">{widget.title || "Today's Schedule"}</div>
              <div className="widget-subtitle">Live Class Lectures & Labs</div>
            </div>
          </div>
        </div>
        <div className="classes-timeline-list">
          {items.map((c, i) => (
            <div key={i} className={`class-timeline-item ${c.active ? 'active-slot' : ''}`}>
              <div className="time-badge">{c.time}</div>
              <div className="class-desc">
                <span className="subject-title">{c.subject}</span>
                <span className="room-title">📍 {c.room}</span>
              </div>
              {c.active && <span className="live-now-tag">NOW</span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

/* -------------------------------------------------------------------------
   Helper: Greetings by language
------------------------------------------------------------------------- */
function getGreeting(lang, name) {
  if (lang && lang.startsWith('te')) {
    return `నమస్కారం ${name}! నేను మీ స్మార్ట్ క్యాంపస్ AI అసిస్టెంట్ (Google Gemini మోడల్ శక్తితో పనిచేస్తోంది). మీ అటెండెన్స్, మార్కులు, ఫీజుల వివరాలు లేదా క్లాసుల గురించి నన్ను అడగవచ్చు.`
  }
  return `Hello ${name}! I'm your Smart Campus AI Assistant, powered by Google Gemini architecture. Ask me about your attendance, marks, semester fees, or schedule!`
}

/* -------------------------------------------------------------------------
   Main ChatBox Component
------------------------------------------------------------------------- */
export default function ChatBox({ studentName = 'Student', onClose, embedded = false }) {
  const [language, setLanguage] = useState('en-IN')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState(false)
  const [playingMsgIndex, setPlayingMsgIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [feedbackState, setFeedbackState] = useState({})
  const [error, setError] = useState('')

  // ChatGPT Chat History state
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const languageRef = useRef('en-IN')
  const autoSpeechRef = useRef(false)

  // Load chat history sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartcampus_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSessions(parsed)
      }
    } catch (e) {
      console.warn('Could not load chat history', e)
    }
  }, [])

  // Auto-save active chat session to history
  useEffect(() => {
    if (messages.length === 0) return

    const userFirstMsg = messages.find((m) => m.from === 'user')
    const sessionTitle = userFirstMsg ? userFirstMsg.text.slice(0, 32) + (userFirstMsg.text.length > 32 ? '...' : '') : 'Chat Conversation'
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setSessions((prevSessions) => {
      let updated = []
      const existingIdx = prevSessions.findIndex((s) => s.id === currentSessionId)
      if (existingIdx >= 0) {
        updated = [...prevSessions]
        updated[existingIdx] = {
          ...updated[existingIdx],
          messages,
          timestamp: nowStr
        }
      } else {
        const newId = currentSessionId || `session_${Date.now()}`
        if (!currentSessionId) setCurrentSessionId(newId)
        updated = [
          { id: newId, title: sessionTitle, timestamp: nowStr, messages },
          ...prevSessions
        ]
      }
      try {
        localStorage.setItem('smartcampus_chat_history', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }, [messages, currentSessionId])

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(`session_${Date.now()}`)
    setIsHistoryOpen(false)
    setError('')
  }

  const loadSession = (session) => {
    setCurrentSessionId(session.id)
    setMessages(session.messages || [])
    setIsHistoryOpen(false)
    setError('')
  }

  const deleteSession = (sessionId) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId)
      try {
        localStorage.setItem('smartcampus_chat_history', JSON.stringify(filtered))
      } catch (e) {}
      return filtered
    })
    if (currentSessionId === sessionId) {
      startNewChat()
    }
  }

  const clearAllHistory = () => {
    setSessions([])
    try { localStorage.removeItem('smartcampus_chat_history') } catch (e) {}
    startNewChat()
  }

  useEffect(() => {
    languageRef.current = language
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  useEffect(() => {
    autoSpeechRef.current = autoSpeechEnabled
  }, [autoSpeechEnabled])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Speech synthesis & recognition initialization
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition && window.speechSynthesis) {
      const recognition = new SpeechRecognition()
      recognition.lang = languageRef.current
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        sendMessage(transcript)
      }

      recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
          setError(`Voice recognition error: ${event.error}`)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      setVoiceSupported(true)
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        try { recognitionRef.current.stop() } catch (e) {}
      }
    }
  }, [])

  // Speak specific text using Web Speech Synthesis
  const speakText = (text, index = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    if (index !== null && playingMsgIndex === index) {
      setPlayingMsgIndex(null)
      return
    }

    const cleanText = text
      .replace(/[*_#~`]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = languageRef.current
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const targetLang = languageRef.current.toLowerCase()
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().includes(targetLang))
    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    if (index !== null) {
      setPlayingMsgIndex(index)
    }

    utterance.onend = () => {
      setPlayingMsgIndex(null)
    }

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        setError('Speech synthesis failed.')
      }
      setPlayingMsgIndex(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  // Toggle voice mic recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser.')
      return
    }

    if (isRecording) {
      try { recognitionRef.current.stop() } catch (e) {}
      setIsRecording(false)
      return
    }

    setError('')
    setIsRecording(true)
    try {
      recognitionRef.current.lang = languageRef.current
      recognitionRef.current.start()
    } catch (e) {
      setError('Microphone access denied or unequipped.')
      setIsRecording(false)
    }
  }

  // Copy message text
  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Handle message feedback
  const handleFeedback = (index, type) => {
    setFeedbackState((prev) => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }))
  }

  // Send message API call
  const sendMessage = async (messageOverride) => {
    const text = messageOverride ?? input
    if (!text.trim()) return

    const userMsg = { from: 'user', text, timestamp: new Date() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setError('')
    setIsTyping(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_name: studentName,
          language: languageRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error('AI chat service is temporarily unavailable.')
      }

      const data = await response.json()
      const replyText = data.reply || 'No response generated.'
      const widgetObj = data.widget || null

      const botMsg = { from: 'bot', text: replyText, widget: widgetObj, timestamp: new Date() }
      setMessages((m) => [...m, botMsg])

      if (voiceSupported && autoSpeechRef.current) {
        speakText(replyText)
      }
    } catch (err) {
      const errorReply = language.startsWith('te')
        ? 'క్షమించండి, AI కనెక్షన్ సర్వర్‌లో సమస్య ఏర్పడింది.'
        : 'Sorry, unable to connect to Smart Campus AI.'
      setMessages((m) => [...m, { from: 'bot', text: errorReply, timestamp: new Date() }])
      setError(err.message || 'Connection error.')
    } finally {
      setIsTyping(false)
    }
  }

  // Quick suggestion chips
  const suggestionChips = [
    { label: language.startsWith('te') ? '📊 నా అటెండెన్స్' : '📊 My Attendance', prompt: 'show my attendance' },
    { label: language.startsWith('te') ? '🏅 నా మార్కులు' : '🏅 My Marks Breakdown', prompt: 'show my marks' },
    { label: language.startsWith('te') ? '💳 ఫీజు బకాయిలు' : '💳 Fee Dues Status', prompt: 'show my fee dues' },
    { label: language.startsWith('te') ? '🚀 సమగ్ర ప్రదర్శన' : '🚀 Overall Performance', prompt: 'show my overall performance summary' },
    { label: language.startsWith('te') ? '👤 ప్రొఫైల్ కార్డు' : '👤 Registration Card', prompt: 'show my profile' },
    { label: language.startsWith('te') ? '🕒 క్లాసుల షెడ్యూల్' : '🕒 Class Timetable', prompt: 'show my schedule for today' },
  ]

  return (
    <div className={`gemini-chatbox-root ${embedded ? 'embedded' : ''}`}>
      {/* Visual Mic Active Overlay */}
      {isRecording && (
        <div className="mic-recording-overlay">
          <div className="mic-pulse-ring ring-1"></div>
          <div className="mic-pulse-ring ring-2"></div>
          <div className="mic-pulse-ring ring-3"></div>
          <div className="mic-active-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </div>
          <p className="mic-listening-text">
            {language.startsWith('te') ? 'మాట్లాడండి... మీ మాటలు వింటున్నాం...' : 'Listening... Speak now...'}
          </p>
          <button className="stop-mic-btn" onClick={toggleRecording}>Stop Listening</button>
        </div>
      )}

      {/* ChatGPT Style History Sidebar Drawer */}
      {isHistoryOpen && (
        <div className="chat-history-sidebar">
          <div className="history-sidebar-header">
            <button className="new-chat-btn" onClick={startNewChat}>
              <span>+</span> New Chat
            </button>
            <button className="close-sidebar-btn" onClick={() => setIsHistoryOpen(false)}>
              &times;
            </button>
          </div>

          <div className="history-sessions-list">
            <div className="history-section-label">Chat History</div>
            {sessions.length === 0 ? (
              <div className="no-history-msg">No past conversations saved yet.</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`history-session-item ${currentSessionId === sess.id ? 'active' : ''}`}
                  onClick={() => loadSession(sess)}
                >
                  <span className="session-icon">💬</span>
                  <div className="session-info">
                    <span className="session-title">{sess.title}</span>
                    <span className="session-time">{sess.timestamp}</span>
                  </div>
                  <button
                    className="delete-session-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(sess.id)
                    }}
                    title="Delete session"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>

          {sessions.length > 0 && (
            <div className="history-sidebar-footer">
              <button className="clear-all-btn" onClick={clearAllHistory}>
                Clear All History
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header Bar */}
      <div className="gemini-header">
        <div className="gemini-header-left">
          {/* Top-Left Back Button */}
          <button
            className="gemini-back-btn"
            onClick={onClose || (() => window.history.back())}
            title="Go Back"
          >
            ← Back
          </button>

          {/* ChatGPT History Sidebar Toggle Button */}
          <button
            className={`chat-history-toggle-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="ChatGPT Chat History"
          >
            💬 History
          </button>

          <div className="gemini-brand-title">
            <GeminiSparkleIcon size={24} />
            <div className="brand-text-column">
              <span className="brand-name">Smart Campus AI</span>
              <span className="brand-model">Powered by Google Gemini</span>
            </div>
          </div>
        </div>

        <div className="gemini-header-controls">
          {/* Bilingual Language Selector Pills */}
          <div className="language-pills-selector">
            <button
              className={`lang-pill ${language === 'en-IN' ? 'active' : ''}`}
              onClick={() => setLanguage('en-IN')}
            >
              🇬🇧 English
            </button>
            <button
              className={`lang-pill ${language === 'te-IN' ? 'active' : ''}`}
              onClick={() => setLanguage('te-IN')}
            >
              🇮🇳 తెలుగు
            </button>
          </div>

          {/* Auto Voice Output Toggle */}
          {voiceSupported && (
            <button
              className={`auto-speech-btn ${autoSpeechEnabled ? 'active' : ''}`}
              onClick={() => setAutoSpeechEnabled(!autoSpeechEnabled)}
              title={autoSpeechEnabled ? 'Disable Auto Voice Readout' : 'Enable Auto Voice Readout'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                {autoSpeechEnabled ? (
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                ) : (
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                )}
              </svg>
              <span className="btn-label">{autoSpeechEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
          )}

          {!embedded && (
            <button className="close-chat-btn" onClick={onClose} aria-label="Close Chat">
              &times;
            </button>
          )}
        </div>
      </div>


      {/* Main Messages & Welcome Body */}
      <div className="gemini-messages-area">
        {messages.length === 0 ? (
          <div className="gemini-welcome-container">
            <div className="sparkle-hero-wrapper">
              <GeminiSparkleIcon size={64} />
            </div>
            <h2 className="welcome-heading">
              {language.startsWith('te') ? `నమస్కారం, ${studentName}` : `Hello, ${studentName}`}
            </h2>
            <p className="welcome-subtext">
              {getGreeting(language, studentName)}
            </p>

            <div className="suggestions-grid">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  className="suggestion-card-btn"
                  onClick={() => sendMessage(chip.prompt)}
                >
                  <span className="card-chip-text">{chip.label}</span>
                  <span className="card-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-stream-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.from}`}>
                <div className="avatar-col">
                  {msg.from === 'user' ? (
                    <div className="user-avatar-badge">{studentName.charAt(0).toUpperCase()}</div>
                  ) : (
                    <div className="gemini-avatar-badge">
                      <GeminiSparkleIcon size={18} />
                    </div>
                  )}
                </div>

                <div className="content-col">
                  <div className="msg-bubble">
                    {msg.from === 'bot' && idx === messages.length - 1 && isTyping === false ? (
                      <TypewriterText text={msg.text} speed={14} />
                    ) : (
                      <span>{msg.text}</span>
                    )}

                    {msg.widget && <RenderWidget widget={msg.widget} />}
                  </div>

                  {/* Per-Message Action Bar for Bot Replies */}
                  {msg.from === 'bot' && (
                    <div className="bot-action-toolbar">
                      <button
                        className={`action-icon-btn ${playingMsgIndex === idx ? 'playing' : ''}`}
                        onClick={() => speakText(msg.text, idx)}
                        title="Read aloud"
                      >
                        🔊
                      </button>
                      <button
                        className="action-icon-btn"
                        onClick={() => copyMessage(msg.text, idx)}
                        title="Copy response"
                      >
                        {copiedIndex === idx ? '✓ Copied' : '📋'}
                      </button>
                      <button
                        className={`action-icon-btn ${feedbackState[idx] === 'up' ? 'active' : ''}`}
                        onClick={() => handleFeedback(idx, 'up')}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        className={`action-icon-btn ${feedbackState[idx] === 'down' ? 'active' : ''}`}
                        onClick={() => handleFeedback(idx, 'down')}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row bot typing">
                <div className="avatar-col">
                  <div className="gemini-avatar-badge pulse">
                    <GeminiSparkleIcon size={18} />
                  </div>
                </div>
                <div className="content-col">
                  <div className="msg-bubble typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggestion Bar when active */}
      {messages.length > 0 && (
        <div className="chips-scroll-bar">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              className="quick-chip-btn"
              onClick={() => sendMessage(chip.prompt)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Control Box */}
      <div className="gemini-input-container">
        <div className="input-field-wrapper">
          <input
            type="text"
            className="gemini-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
            placeholder={
              language.startsWith('te')
                ? 'స్మార్ట్ క్యాంపస్ AI ని ప్రశ్నించండి...'
                : 'Ask Smart Campus AI anything about attendance, marks, fees...'
            }
            disabled={isTyping}
          />

          {voiceSupported && (
            <button
              className={`mic-trigger-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={isTyping}
              title="Voice Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </button>
          )}

          <button
            className="send-arrow-btn"
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            title="Send Message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {error && <div className="gemini-error-toast">⚠ {error}</div>}
    </div>
  )
}

