import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProfileModal from './components/ProfileModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1111/api/chats';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal & Theme states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Create a guest user profile automatically
  const createGuestUser = async () => {
    try {
      const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
      const guestData = {
        name: 'Guest User',
        gender: 'male',
        dob: '2000-01-01',
        avatar: 'male',
        language: 'English',
        contactNo: '0000000000',
        email: `guest_${uniqueSuffix}@example.com`,
        city: 'Guest City'
      };
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('chat_user_id', data._id);
        setCurrentUser(data);
      } else {
        console.error("Failed to auto-register guest user");
      }
    } catch (err) {
      console.error("Error auto-registering guest user:", err);
    }
  };

  // Verify auth session on mount or register guest
  useEffect(() => {
    const savedUserId = localStorage.getItem('chat_user_id');
    if (savedUserId) {
      fetchProfile(savedUserId);
    } else {
      createGuestUser();
    }
  }, []);

  // Fetch chats whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchChats();
    } else {
      setChats([]);
      setActiveChatId(null);
    }
  }, [currentUser]);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { 'X-User-Id': userId }
      });
      if (!res.ok) {
        // Clear broken session
        localStorage.removeItem('chat_user_id');
        setCurrentUser(null);
        createGuestUser();
        return;
      }
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchChats = async () => {
    if (!currentUser) return;
    try {
      setError(null);
      const res = await fetch(API_BASE_URL, {
        headers: { 'X-User-Id': currentUser._id }
      });
      if (!res.ok) throw new Error('Failed to load chat history');
      const data = await res.json();
      setChats(data);
      if (data.length > 0 && !activeChatId) {
        setActiveChatId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure your server is running.');
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    if (!currentUser) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser._id
        },
        body: JSON.stringify(updatedProfile),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setCurrentUser(data);
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
      setError('Could not update profile information.');
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/${chatId}/messages`);
      if (!res.ok) throw new Error('Failed to retrieve messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError('Error retrieving message history.');
    }
  };

  const handleCreateChat = async () => {
    if (!currentUser) return;
    try {
      setError(null);
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'X-User-Id': currentUser._id }
      });
      if (!res.ok) throw new Error('Failed to start new chat');
      const newChat = await res.json();
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
      setError('Could not create a new chat.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/${chatId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete chat');
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    } catch (err) {
      console.error(err);
      setError('Could not delete the chat.');
    }
  };

  const handleUpdateChatTitle = async (chatId, title) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to update title');
      const updatedChat = await res.json();
      setChats((prev) => prev.map((c) => (c._id === chatId ? updatedChat : c)));
    } catch (err) {
      console.error(err);
      setError('Could not rename the chat.');
    }
  };

  const handleSendMessage = async (content, image) => {
    if (!activeChatId || !currentUser) return;
    try {
      setError(null);
      setLoading(true);

      const tempUserMessage = {
        _id: Date.now().toString(),
        chatId: activeChatId,
        sender: 'user',
        content,
        attachment: image ? { base64: image.base64, mimeType: image.mimeType } : null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      const res = await fetch(`${API_BASE_URL}/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser._id
        },
        body: JSON.stringify({ content, image }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();

      setMessages((prev) =>
        prev.filter((m) => m._id !== tempUserMessage._id).concat([data.userMessage, data.aiMessage])
      );

      fetchChats();
    } catch (err) {
      console.error(err);
      setError('Could not generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogOut = () => {
    localStorage.removeItem('chat_user_id');
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
  };

  // Show loading indicator until auto-guest registration is done
  if (!currentUser) {
    return (
      <div className={`app-container ${theme}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="dots-wrapper">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    );
  }

  const activeChat = chats.find((c) => c._id === activeChatId);

  return (
    <div className={`app-container ${theme}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar history */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatTitle={handleUpdateChatTitle}
        currentUser={currentUser}
        onLogOut={handleLogOut}
        isOpen={isSidebarOpen}
      />

      {/* Main chat window container */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-close">
              Dismiss
            </button>
          </div>
        )}

        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          loading={loading}
          onSendMessage={handleSendMessage}
          onOpenProfile={() => setIsProfileOpen(true)}
          profile={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
      </div>

      {/* User profile configuration Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={currentUser}
      />
    </div>
  );
}
