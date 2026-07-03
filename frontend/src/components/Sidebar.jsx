import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, Edit3, Check, X, LogOut } from 'lucide-react';
import { MaleAvatarSVG, FemaleAvatarSVG } from './ProfileModal';

export default function Sidebar({ chats, activeChatId, onSelectChat, onCreateChat, onDeleteChat, onUpdateChatTitle, currentUser, onLogOut, isOpen }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveTitle = async (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onUpdateChatTitle(chatId, editTitle.trim());
      setEditingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-name">AI Chatbot</span>
          <span className="brand-badge">MERN</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="new-chat-btn-container">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onCreateChat}
          className="new-chat-btn"
        >
          <Plus size={16} />
          New Chat
        </motion.button>
      </div>

      {/* Section Title */}
      <div className="history-title">Chat History</div>

      {/* History List */}
      <div className="history-list">
        <AnimatePresence initial={false}>
          {chats.map((chat) => {
            const isActive = chat._id === activeChatId;
            const isEditing = chat._id === editingId;

            return (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onClick={() => !isEditing && onSelectChat(chat._id)}
                className={`chat-item ${isActive ? 'active' : ''}`}
              >
                <div className="chat-item-icon">
                  <MessageSquare size={16} />
                </div>

                <div className="chat-item-details">
                  {isEditing ? (
                    <div className="edit-title-container" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveTitle(chat._id, e)}
                        autoFocus
                        className="edit-title-input"
                      />
                      <button onClick={(e) => saveTitle(chat._id, e)} className="action-btn">
                        <Check size={14} className="text-emerald-400" />
                      </button>
                      <button onClick={cancelEditing} className="action-btn">
                        <X size={14} className="text-rose-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="chat-item-title">{chat.title}</div>
                      <div className="chat-item-date">{formatDate(chat.updatedAt || chat.createdAt)}</div>
                    </>
                  )}
                </div>

                {/* Inline Action Buttons (Delete / Edit) */}
                {!isEditing && (
                  <div className="chat-item-actions">
                    <button
                      onClick={(e) => startEditing(chat, e)}
                      className="action-btn"
                      title="Rename Chat"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      className="action-btn delete"
                      title="Delete Chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {chats.length === 0 && (
          <div className="no-history-text">
            No history available.
          </div>
        )}
      </div>

      {/* Sidebar Footer / User Profile section */}
      {currentUser && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, width: '100%' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
              {currentUser.avatar === 'female' ? <FemaleAvatarSVG /> : <MaleAvatarSVG />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.email}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
