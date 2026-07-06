import React, { useState, useEffect, useRef } from 'react'
import './ChatBox.css'

function ChatBox({ studentName, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'system', text: `Hello ${studentName}, how can I help you today?` }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg = { from: 'user', text: input }
    setMessages((m) => [...m, userMsg])
    setInput('')

    // lightweight echo/responder for demo
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: `You said: "${userMsg.text}"` }])
    }, 700)
  }

  return (
    <div className="chatbox-root">
      <div className="chatbox-header">
        <span>Student Chat</span>
        <button
          type="button"
          className="chatbox-close-btn"
          onClick={() => onClose?.()}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg chat-${msg.from}`}>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Write a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default ChatBox
