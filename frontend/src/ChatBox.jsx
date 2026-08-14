import React, { useState, useEffect, useRef } from 'react'
import './ChatBox.css'
import { API_BASE_URL } from './config'

function RenderWidget({ widget }) {
  if (!widget || !widget.type) return null

  if (widget.type === 'attendance') {
    const { total_days, attended_days, percentage, status } = widget.data || {}
    const isSafe = status?.toLowerCase().includes('safe')
    return (
      <div className="chat-widget-card">
        <div className="widget-title-bar">
          <span>📊 {widget.title || 'Attendance Overview'}</span>
          <span className={`widget-status-pill ${isSafe ? 'safe' : 'risk'}`}>
            {status}
          </span>
        </div>
        <div className="widget-attendance-body">
          <div className="widget-pct-large">
            <span>{percentage}%</span>
            <span className="widget-meta-text">
              {attended_days} / {total_days} Days
            </span>
          </div>
          <div className="widget-progress-bg">
            <div className="widget-progress-fill" style={{ width: `${Math.min(100, percentage)}%` }} />
          </div>
          <div className="widget-meta-text">
            75% Attendance required for Autonomous semester exams.
          </div>
        </div>
      </div>
    )
  }

  if (widget.type === 'marks') {
    const { gpa, items = [] } = widget.data || {}
    return (
      <div className="chat-widget-card">
        <div className="widget-title-bar">
          <span>🏅 {widget.title || 'Academic Performance'}</span>
          <span style={{ color: '#fbbf24', fontWeight: 800 }}>{gpa} GPA</span>
        </div>
        <div className="widget-marks-list">
          {items.map((m, i) => {
            const pct = Math.min(100, Math.round((m.total / 150) * 100))
            return (
              <div key={i} className="widget-mark-item">
                <div className="widget-mark-header">
                  <span>{m.subject}</span>
                  <span>{m.total} / 150</span>
                </div>
                <div className="widget-mark-bar-bg">
                  <div className="widget-mark-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (widget.type === 'fees') {
    const { total_fee = 0, paid_fee = 0, due_fee = 0, status = 'Paid' } = widget.data || {}
    const isPaid = status.toLowerCase() === 'paid'
    return (
      <div className="chat-widget-card">
        <div className="widget-title-bar">
          <span>💳 {widget.title || 'Semester Fee Dues'}</span>
          <span className={`widget-status-pill ${isPaid ? 'safe' : 'risk'}`}>
            {status}
          </span>
        </div>
        <div className="widget-fee-grid">
          <div className="widget-fee-box">
            <span className="widget-fee-label">TOTAL</span>
            <span className="widget-fee-val">₹{total_fee.toLocaleString('en-IN')}</span>
          </div>
          <div className="widget-fee-box">
            <span className="widget-fee-label">PAID</span>
            <span className="widget-fee-val paid">₹{paid_fee.toLocaleString('en-IN')}</span>
          </div>
          <div className="widget-fee-box">
            <span className="widget-fee-label">DUE</span>
            <span className="widget-fee-val due">₹{due_fee.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (widget.type === 'profile') {
    const { name, reg_number, branch, course, year } = widget.data || {}
    return (
      <div className="chat-widget-card">
        <div className="widget-title-bar">
          <span>👤 {widget.title || 'Student Profile'}</span>
          <span style={{ color: '#38bdf8' }}>Year {year}</span>
        </div>
        <div className="widget-profile-box">
          <div className="widget-avatar-big">{name ? name.charAt(0).toUpperCase() : 'S'}</div>
          <div className="widget-profile-info">
            <span className="widget-profile-name">{name}</span>
            <span className="widget-profile-sub">Reg No: {reg_number}</span>
            <span className="widget-profile-sub">{course} • {branch}</span>
          </div>
        </div>
      </div>
    )
  }

  if (widget.type === 'classes') {
    const { items = [] } = widget.data || {}
    return (
      <div className="chat-widget-card">
        <div className="widget-title-bar">
          <span>🕒 {widget.title || "Today's Schedule"}</span>
        </div>
        <div className="widget-classes-list">
          {items.map((c, i) => (
            <div key={i} className="widget-class-item">
              <span className="widget-class-time">{c.time}</span>
              <span className="widget-class-title">{c.subject} ({c.room})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function ChatBox({ studentName, onClose, embedded = false }) {
  const [language, setLanguage] = useState('en-IN')
  const [messages, setMessages] = useState([
    { from: 'system', text: `Hello ${studentName}! I am your Smart Campus AI Assistant. How can I help you?` }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [speechToSpeechActive, setSpeechToSpeechActive] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechToSpeechRef = useRef(false)
  const languageRef = useRef('en-IN')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    speechToSpeechRef.current = speechToSpeechActive
    if (!speechToSpeechActive) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (isRecording && recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
    }
  }, [speechToSpeechActive])

  useEffect(() => {
    languageRef.current = language
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  useEffect(() => {
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
          setError(`Voice input error (${event.error}).`)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      setVoiceSupported(true)
    }
  }, [])

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    
    window.speechSynthesis.cancel()

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = languageRef.current
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      // Find best matching voice for current language if available
      const voices = window.speechSynthesis.getVoices()
      const langVoice = voices.find(v => v.lang.toLowerCase().includes(languageRef.current.toLowerCase()))
      if (langVoice) {
        utterance.voice = langVoice
      }

      utterance.onend = () => {
        if (speechToSpeechRef.current && recognitionRef.current) {
          setError('')
          setIsRecording(true)
          try {
            recognitionRef.current.lang = languageRef.current
            recognitionRef.current.start()
          } catch (e) {
            setIsRecording(false)
          }
        }
      }

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          setError('Speech playback failed.')
        }
      }

      window.speechSynthesis.speak(utterance)
    }, 100)
  }

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
      setError('Could not start microphone input.')
      setIsRecording(false)
    }
  }

  const handleToggleSpeechToSpeech = () => {
    const nextState = !speechToSpeechActive
    setSpeechToSpeechActive(nextState)
    if (nextState) {
      setError('')
      const promptMsg = language.startsWith('te')
        ? "స్పీచ్ మోడ్ ఆన్ చేయబడింది. నేను మీకు ఎలా సహాయం చేయగలను?"
        : "Speech mode enabled. How can I help you?"
      speakText(promptMsg)
    } else {
      window.speechSynthesis.cancel()
      if (isRecording) {
        try { recognitionRef.current?.stop() } catch (e) {}
        setIsRecording(false)
      }
    }
  }

  const sendMessage = async (messageOverride) => {
    const text = messageOverride ?? input
    if (!text.trim()) return

    const userMsg = { from: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setError('')
    setIsTyping(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user_name: studentName,
          language: languageRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error('AI chat service is unavailable.')
      }

      const data = await response.json()
      const replyText = data.reply || 'Sorry, I could not generate a response.'
      const widgetObj = data.widget || null

      setMessages((m) => [...m, { from: 'bot', text: replyText, widget: widgetObj }])
      
      if (voiceSupported && speechToSpeechActive) {
        speakText(replyText)
      }
    } catch (err) {
      const errorReply = language.startsWith('te')
        ? 'క్షమించండి, AI సేవను అనుసంధానించడంలో సమస్య ఏర్పడింది.'
        : 'Sorry, I could not connect to the AI chat service.'
      setMessages((m) => [...m, { from: 'bot', text: errorReply }])
      setError(err.message || 'Something went wrong.')
      if (voiceSupported && speechToSpeechActive) {
        speakText(errorReply)
      }
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className={`chatbox-root ${embedded ? 'embedded' : ''}`}>
      {/* Header Bar */}
      <div className="chatbox-header">
        <div className="chatbox-header-title">
          <span>🤖</span>
          <span>Smart Campus AI Assistant</span>
        </div>

        <div className="chatbox-header-actions">
          {/* Language Selector Dropdown */}
          <select
            className="lang-select-dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select speech language"
            title="Speech & Voice Language"
          >
            <option value="en-IN">🌐 Indian English (en-IN)</option>
            <option value="te-IN">🇮🇳 తెలుగు (te-IN)</option>
            <option value="en-US">🇺🇸 US English (en-US)</option>
          </select>

          {/* Speech to Speech Toggle */}
          {voiceSupported && (
            <button
              type="button"
              className={`s2s-toggle-btn ${speechToSpeechActive ? 'active' : ''}`}
              onClick={handleToggleSpeechToSpeech}
              title={speechToSpeechActive ? "Disable Speech-to-Speech" : "Enable Speech-to-Speech"}
              aria-label="Toggle Speech-to-Speech"
            >
              <svg className="s2s-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {speechToSpeechActive ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </>
                )}
              </svg>
              <span className="s2s-label">Speech Mode</span>
            </button>
          )}

          {!embedded && (
            <button
              type="button"
              className="chatbox-close-btn"
              onClick={() => onClose?.()}
              aria-label="Close chat"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg chat-${msg.from}`}>
            <div className="chat-text">{msg.text}</div>
            {msg.widget && <RenderWidget widget={msg.widget} />}
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg chat-bot">
            <div className="chat-text">AI is typing response...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Control Bar */}
      <div className="chatbox-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          placeholder={language.startsWith('te') ? "మీ ప్రశ్నను టైప్ చేయండి లేదా మాట్లాడండి..." : "Ask about attendance, grades, fees..."}
          disabled={isTyping}
        />

        {voiceSupported && (
          <button
            type="button"
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={isTyping}
            title={isRecording ? "Stop voice input" : `Speak in ${language}`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? (
              <div className="voice-active-waves">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
            ) : (
              <svg className="mic-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            )}
          </button>
        )}

        <button className="send-btn" onClick={() => sendMessage()} disabled={isTyping}>
          Send
        </button>
      </div>

      {error && <div className="chatbox-error">⚠️ {error}</div>}
    </div>
  )
}

export default ChatBox
