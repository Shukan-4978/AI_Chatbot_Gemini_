import React, { useRef, useEffect, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Send, Share2, Clipboard, Check, Paperclip, X, Sun, Moon, Menu } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import { MaleAvatarSVG, FemaleAvatarSVG } from './ProfileModal';

// Custom lightweight markdown and code block parser
function MarkdownContent({ text }) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2].trim() : part.slice(3, -3).trim();

          return <CodeBlock key={index} code={code} lang={lang} />;
        } else {
          return <TextParagraph key={index} text={part} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: '12px 0',
      overflow: 'hidden',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(0, 0, 0, 0.35)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0.5px' }}>
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer'
          }}
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" style={{ color: '#34d399' }} />
              <span style={{ color: '#34d399', fontWeight: '500' }}>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre style={{
        padding: '16px',
        overflowX: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ddd6fe',
        margin: 0
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextParagraph({ text }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, idx) => {
        let cleanLine = line;

        if (cleanLine.startsWith('# ')) {
          return <h1 key={idx} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: '12px 0 6px 0' }}>{cleanLine.slice(2)}</h1>;
        }
        if (cleanLine.startsWith('## ')) {
          return <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '10px 0 6px 0' }}>{cleanLine.slice(3)}</h2>;
        }
        if (cleanLine.startsWith('### ')) {
          return <h3 key={idx} style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: '8px 0 4px 0' }}>{cleanLine.slice(4)}</h3>;
        }

        if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '8px' }}>
              <span style={{ color: '#a78bfa' }}>•</span>
              <span>{parseInlineMarkdown(cleanLine.slice(2))}</span>
            </div>
          );
        }

        if (!cleanLine.trim()) return <div key={idx} style={{ height: '8px' }} />;

        return <p key={idx} style={{ margin: 0 }}>{parseInlineMarkdown(cleanLine)}</p>;
      })}
    </div>
  );
}

function parseInlineMarkdown(text) {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ fontWeight: 'bold', color: 'white' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} style={{
        padding: '2px 6px',
        borderRadius: '4px',
        background: 'rgba(255, 255, 255, 0.08)',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#c084fc'
      }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function ChatWindow({ activeChat, messages, loading, onSendMessage, onOpenProfile, profile, theme, onToggleTheme, onToggleSidebar }) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { base64: "...", mimeType: "..." }
  const messagesEndRef = useRef(null);
  const [messagesContainerRef] = useAutoAnimate();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only images are supported for AI visual analysis currently.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        base64: reader.result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    
    onSendMessage(trimmed, selectedImage);
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustHeight = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleShare = async () => {
    if (!messages || messages.length === 0) return;

    let chatText = 'AI Chat Conversation\n\n';
    messages.forEach((msg) => {
      const sender = msg.sender === 'user' ? 'User' : 'AI';
      chatText += `${sender}: ${msg.content}\n\n`;
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeChat?.title || 'Gemini AI Conversation',
          text: chatText,
        });
      } catch (error) {
        console.log('Share canceled');
      }
    } else {
      await navigator.clipboard.writeText(chatText);
      alert('Conversation copied to clipboard!');
    }
  };

  // Render correct user profile avatar on bubbles
  const renderUserAvatar = () => {
    if (profile && profile.avatar === 'female') {
      return <FemaleAvatarSVG />;
    }
    return <MaleAvatarSVG />;
  };
  if (!activeChat) {
    return (
      <div className="welcome-container">
        {/* Mobile Menu Toggle Button */}
        <div style={{ position: 'absolute', top: 0, left: 0, padding: '16px' }}>
          <button onClick={onToggleSidebar} className="header-icon-btn menu-toggle-btn" title="Toggle Sidebar">
            <Menu size={18} />
          </button>
        </div>

        {/* Header (still needed to switch profile/themes when activeChat is null) */}
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onToggleTheme} className="header-icon-btn" title="Toggle Light/Dark Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onOpenProfile} className="profile-avatar-btn" title="Open Profile Settings">
            {renderUserAvatar()}
          </button>
        </div>

        <div className="welcome-content">
          <div className="welcome-logo">💬</div>
          <h2 className="welcome-title">Select a Chat or Start a New One</h2>
          <p className="welcome-desc">
            Engage with Google's advanced Gemini model to brainstorm ideas, write code, or just have a conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <header className="chat-window-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button onClick={onToggleSidebar} className="header-icon-btn menu-toggle-btn" title="Toggle Sidebar">
            <Menu size={18} />
          </button>
          <div className="header-title-container">
            <h2 className="header-title">{activeChat.title}</h2>
            <p className="header-subtitle">Active conversation session</p>
          </div>
        </div>

        <div className="header-actions">
          {messages.length > 0 && (
            <button onClick={handleShare} className="share-btn">
              <Share2 size={13} />
              Share Chat
            </button>
          )}

          {/* Theme switcher */}
          <button onClick={onToggleTheme} className="header-icon-btn" title="Toggle Light/Dark Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Profile selector icon */}
          <button onClick={onOpenProfile} className="profile-avatar-btn" title="Open Profile Settings">
            {renderUserAvatar()}
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <div className="message-feed" ref={messagesContainerRef}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg._id} className={`message-item ${isUser ? 'user' : 'model'}`}>
              <div className={`avatar ${isUser ? 'user' : 'ai'}`}>
                {isUser ? renderUserAvatar() : 'AI'}
              </div>
              <div className="message-bubble">
                {/* Visual Attachment (Image) in Chat Bubble */}
                {msg.attachment && msg.attachment.base64 && (
                  <div className="bubble-image-preview">
                    <img src={msg.attachment.base64} alt="Attachment" />
                  </div>
                )}
                <MarkdownContent text={msg.content} />
              </div>
            </div>
          );
        })}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input section with file attachments */}
      <div className="input-section">
        {/* Attachment preview panel */}
        {selectedImage && (
          <div className="media-preview-container">
            <div className="media-preview-box">
              <img src={selectedImage.base64} alt="Attached Preview" />
              <button onClick={handleRemoveImage} className="remove-media-btn">
                <X size={10} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          {/* File selector input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={triggerFileSelect}
            className="attach-btn"
            title="Attach media files"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={adjustHeight}
            placeholder="Type your message here..."
            className="input-textarea"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || loading}
            className="send-btn"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
