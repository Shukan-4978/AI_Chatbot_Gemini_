import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="message-item model">
      <div className="avatar ai">AI</div>
      <div className="typing-container">
        <div className="dots-wrapper">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  );
}
