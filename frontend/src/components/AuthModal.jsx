import React, { useState } from 'react';
import { MaleAvatarSVG, FemaleAvatarSVG } from './ProfileModal';

const INDIAN_LANGUAGES = [
  'English',
  'Hindi (हिन्दी)',
  'Bengali (বাংলা)',
  'Marathi (मराठी)',
  'Telugu (తెలుగు)',
  'Tamil (தமிழ்)',
  'Gujarati (ગુજરાતી)',
  'Urdu (اردو)',
  'Kannada (ಕನ್ನಡ)',
  'Odia (ଓଡ଼ିଆ)',
  'Malayalam (മലയാളം)',
  'Punjabi (ਪੰਜਾਬੀ)'
];
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1111/api/chats';

export default function AuthModal({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle login vs register
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  
  // Registration States
  const [regForm, setRegForm] = useState({
    name: '',
    gender: 'male',
    dob: '',
    avatar: 'male',
    language: 'English',
    contactNo: '',
    email: '',
    city: ''
  });

  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Save user ID to localStorage and call success handler
      localStorage.setItem('chat_user_id', data._id);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Show generated password screen
      setGeneratedPassword(data.password);
      setRegisteredUser(data);
      localStorage.setItem('chat_user_id', data._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const proceedToChat = () => {
    if (registeredUser) {
      onAuthSuccess(registeredUser);
    }
  };

  // If user completed registration, show password disclosure screen
  if (generatedPassword) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div className="modal-header" style={{ justifyContent: 'center' }}>
            <h3 className="modal-title" style={{ fontSize: '1.35rem' }}>Registration Successful!</h3>
          </div>
          <div className="modal-body" style={{ gap: '20px', marginTop: '10px' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Here is your unique 4-digit password. Use this passcode to log in next time:
            </p>
            
            {/* PASSCODE DISPLAY BOX */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '2px dashed rgba(167, 139, 250, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              fontSize: '2.5rem',
              fontWeight: '800',
              letterSpacing: '8px',
              color: '#c084fc',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.15)',
              margin: '10px 0'
            }}>
              {generatedPassword}
            </div>

            <p style={{ fontSize: '0.75rem', color: '#fda4af', margin: 0, fontWeight: '500' }}>
              ⚠️ Please write down or save this passcode.
            </p>

            <button onClick={proceedToChat} className="modal-btn save" style={{ width: '100%', padding: '12px' }}>
              Proceed to Chatbot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', gap: '20px' }}>
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: isLogin ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0'
            }}
          >
            Log In
            {isLogin && <span style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: '#a78bfa' }} />}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: !isLogin ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0'
            }}
          >
            Register
            {!isLogin && <span style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: '#a78bfa' }} />}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {isLogin ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="modal-body" style={{ marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Enter 4-Digit Passcode</label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="e.g. 5892"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', padding: '12px' }}
              />
            </div>
            <button type="submit" className="modal-btn save" style={{ marginTop: '10px', padding: '12px' }}>
              Access Chatbot
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="modal-body" style={{ marginTop: '10px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={regForm.name}
                onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Contact Number */}
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={regForm.contactNo}
                onChange={(e) => setRegForm(prev => ({ ...prev, contactNo: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                placeholder="Mumbai"
                value={regForm.city}
                onChange={(e) => setRegForm(prev => ({ ...prev, city: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                value={regForm.gender}
                onChange={(e) => setRegForm(prev => ({
                  ...prev,
                  gender: e.target.value,
                  avatar: e.target.value === 'female' ? 'female' : 'male'
                }))}
                className="form-input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                required
                value={regForm.dob}
                onChange={(e) => setRegForm(prev => ({ ...prev, dob: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Avatar Choose */}
            <div className="form-group">
              <label className="form-label">Avatar</label>
              <div className="avatar-selector">
                <div
                  onClick={() => setRegForm(prev => ({ ...prev, avatar: 'male' }))}
                  className={`avatar-option ${regForm.avatar === 'male' ? 'selected' : ''}`}
                >
                  <div className="avatar-img-preview">
                    <MaleAvatarSVG />
                  </div>
                  <span className="avatar-label">Male</span>
                </div>
                <div
                  onClick={() => setRegForm(prev => ({ ...prev, avatar: 'female' }))}
                  className={`avatar-option ${regForm.avatar === 'female' ? 'selected' : ''}`}
                >
                  <div className="avatar-img-preview">
                    <FemaleAvatarSVG />
                  </div>
                  <span className="avatar-label">Female</span>
                </div>
              </div>
            </div>

            {/* Preferred Language */}
            <div className="form-group">
              <label className="form-label">Preferred Response Language</label>
              <select
                value={regForm.language}
                onChange={(e) => setRegForm(prev => ({ ...prev, language: e.target.value }))}
                className="form-input"
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="modal-btn save" style={{ marginTop: '14px', padding: '12px' }}>
              Register & Generate Passcode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
