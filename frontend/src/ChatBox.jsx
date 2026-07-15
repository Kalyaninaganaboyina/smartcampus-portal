import React, { useState, useEffect, useRef } from 'react'
import './ChatBox.css'

function ChatBox({ studentName, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'system', text: `Hello ${studentName}, how can I help you today?` }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync the ref with the state to avoid stale closures in voice callbacks
  useEffect(() => {
    speechToSpeechRef.current = speechToSpeechActive
    if (!speechToSpeechActive) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [speechToSpeechActive])

  // Cleanup synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition && window.speechSynthesis) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        sendMessage(transcript)
      }

      recognition.onerror = (event) => {
        // Aborted errors are normal if we stop recognition programmatically
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
  }, [])

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    
    // Stop any active speech before starting a new one
    window.speechSynthesis.cancel()

    // Brief timeout to let the cancel complete (critical for Chrome stability)
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        // Automatically start recording again after speaking, if Speech-to-Speech is active
        if (speechToSpeechRef.current && recognitionRef.current) {
          setError('')
          setIsRecording(true)
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error("Failed to start voice input:", e)
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
      setError('Voice input is not supported in this browser.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }

    setError('')
    setIsRecording(true)
    recognitionRef.current.start()
  }

  const handleToggleSpeechToSpeech = () => {
    const nextState = !speechToSpeechActive
    setSpeechToSpeechActive(nextState)
    if (nextState) {
      setError('')
      speakText("Speech mode enabled. How can I help you?")
    } else {
      window.speechSynthesis.cancel()
      if (isRecording) {
        recognitionRef.current?.stop()
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
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, user_name: studentName }),
      })

      if (!response.ok) {
        throw new Error('AI chat service is unavailable.')
      }

      const data = await response.json()
      const replyText = data.reply || 'Sorry, I could not generate a response.'
      setMessages((m) => [...m, { from: 'bot', text: replyText }])
      if (voiceSupported && speechToSpeechActive) {
        speakText(replyText)
      }
    } catch (err) {
      const errorReply = 'Sorry, I could not reach the AI chat service.'
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
    <div className="chatbox-root">
      <div className="chatbox-header">
        <span>Student Chat</span>
        <div className="chatbox-header-actions">
          {voiceSupported && (
            <button
              type="button"
              className={`s2s-toggle-btn ${speechToSpeechActive ? 'active' : ''}`}
              onClick={handleToggleSpeechToSpeech}
              title={speechToSpeechActive ? "Disable Speech-to-Speech" : "Enable Speech-to-Speech"}
              aria-label="Toggle Speech-to-Speech"
            >
              <svg className="s2s-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="s2s-label">Speech-to-Speech</span>
            </button>
          )}
          <button
            type="button"
            className="chatbox-close-btn"
            onClick={() => onClose?.()}
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>
      </div>
      
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg chat-${msg.from}`}>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-msg chat-bot">
            <div className="chat-text">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Write a message..."
          disabled={isTyping}
        />
        {voiceSupported && (
          <button
            type="button"
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={isTyping}
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
        <button className="send-btn" onClick={() => sendMessage()} disabled={isTyping}>Send</button>
      </div>
      {error && <div className="chatbox-error">{error}</div>}
    </div>
  )
}

export default ChatBox

