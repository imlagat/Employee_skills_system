import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../api/axios';
import './AIChatbox.css';

const AIChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat/', { query: userMessage.content });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chatbox-toggle" onClick={toggleChat}>
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <h3>AI Assistant</h3>
            <button onClick={toggleChat} className="close-btn"><X size={20} /></button>
          </div>
          
          <div className="chatbox-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message ai">
                <div className="message-bubble typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="chatbox-input">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbox;
