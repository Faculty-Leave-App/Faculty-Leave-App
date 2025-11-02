import React, { useState } from 'react';

// You can move these styles to your main .css file if you want
const chatStyles = {
  chatWindow: {
    width: '350px',
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
  chatHeader: {
    backgroundColor: '#0078d4',
    color: 'white',
    padding: '12px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chatBody: {
    padding: '10px',
    height: '350px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  message: {
    padding: '8px 12px',
    borderRadius: '18px',
    maxWidth: '80%',
    lineHeight: '1.4',
  },
  userMessage: {
    backgroundColor: '#e1f0ff',
    color: '#000',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#f1f1f1',
    color: '#000',
    alignSelf: 'flex-start',
  },
  chatInputForm: {
    display: 'flex',
    borderTop: '1px solid #ccc',
  },
  input: {
    flexGrow: 1,
    border: 'none',
    padding: '12px',
    outline: 'none',
  },
  button: {
    border: 'none',
    backgroundColor: '#0078d4',
    color: 'white',
    padding: '0 18px',
    cursor: 'pointer',
  },
  toggleButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    fontSize: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    zIndex: 999,
  }
};


function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: 'Hello! How can I help you with your leave request today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === "" || isLoading) return;

    const userMessage = { sender: 'user', text: message };
    setChatLog([...chatLog, userMessage]); // Add user message to log
    setMessage(""); // Clear input
    setIsLoading(true);

    try {
      // Call your Node.js backend endpoint
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = { sender: 'ai', text: data.reply };
        setChatLog(prevLog => [...prevLog, aiMessage]);
      } else {
        const errorMsg = { sender: 'ai', text: `Error: ${data.error || 'Could not connect'}` };
        setChatLog(prevLog => [...prevLog, errorMsg]);
      }

    } catch (err) {
      const errorMsg = { sender: 'ai', text: 'Sorry, the chat server is not reachable.' };
      setChatLog(prevLog => [...prevLog, errorMsg]);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={toggleChat} style={chatStyles.toggleButton}>
        {isOpen ? 'X' : '💬'}
      </button>

      {isOpen && (
        <div style={chatStyles.chatWindow}>
          <div style={chatStyles.chatHeader}>Faculty Chatbot</div>
          <div style={chatStyles.chatBody}>
            {chatLog.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...chatStyles.message,
                  ...(msg.sender === 'user' ? chatStyles.userMessage : chatStyles.aiMessage)
                }}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && <div style={{...chatStyles.message, ...chatStyles.aiMessage}}>...</div>}
          </div>
          <form onSubmit={handleSubmit} style={chatStyles.chatInputForm}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={chatStyles.input}
              placeholder="Ask a question..."
            />
            <button type="submit" style={chatStyles.button}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
