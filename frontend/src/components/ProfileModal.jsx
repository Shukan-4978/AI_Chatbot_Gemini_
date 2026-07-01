import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

export const MaleAvatarSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-violet-400" fill="currentColor">
    <circle cx="50" cy="50" r="50" fill="#2d2a3d"/>
    <circle cx="50" cy="45" r="22" fill="#ffdbac"/>
    <path d="M26 43c0-14 11-23 24-23s24 9 24 23c0 3-2 5-5 5H31c-3 0-5-2-5-5z" fill="#111116"/>
    <path d="M35 25c10-8 20-8 30 0" stroke="#111116" strokeWidth="4" strokeLinecap="round"/>
    <rect x="46" y="60" width="8" height="12" fill="#ffdbac"/>
    <path d="M25 80c5-12 15-18 25-18s20 6 25 18v10H25V80z" fill="#7c3aed"/>
  </svg>
);

export const FemaleAvatarSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400" fill="currentColor">
    <circle cx="50" cy="50" r="50" fill="#3d2a35"/>
    <circle cx="50" cy="50" r="32" fill="#1c120c"/>
    <circle cx="50" cy="45" r="21" fill="#ffd1b3"/>
    <path d="M28 40c0-12 10-21 22-21s22 9 22 21c0 3-1 4-4 4H32c-3 0-4-1-4-4z" fill="#1c120c"/>
    <path d="M29 35c4-7 9-10 14-8s9 6 7 13" fill="#1c120c"/>
    <path d="M71 35c-4-7-9-10-14-8s-9 6-7 13" fill="#1c120c"/>
    <rect x="46" y="58" width="8" height="12" fill="#ffd1b3"/>
    <path d="M25 80c5-12 15-18 25-18s20 6 25 18v10H25V80z" fill="#db2777"/>
  </svg>
);

export default function ProfileModal({ isOpen, onClose, onSave, initialProfile }) {
  const [profile, setProfile] = useState({
    name: '',
    gender: 'male',
    dob: '',
    avatar: 'male',
    language: 'English',
    contactNo: '',
    email: '',
    city: '',
    password: '' // unique generated passcode (read-only)
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(profile);
  };

  const handleGenderChange = (gender) => {
    setProfile(prev => ({
      ...prev,
      gender,
      avatar: gender === 'female' ? 'female' : 'male'
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">User Profile Settings</h3>
          <button onClick={onClose} className="action-btn">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Display Generated Passcode */}
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label" style={{ color: '#c084fc' }}>Your Login Passcode</label>
            <div style={{
              background: 'rgba(167, 139, 250, 0.08)',
              border: '1px solid rgba(167, 139, 250, 0.25)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '3px'
            }}>
              {profile.password}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter your name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
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
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
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
              value={profile.contactNo}
              onChange={(e) => setProfile(prev => ({ ...prev, contactNo: e.target.value }))}
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
              value={profile.city}
              onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => handleGenderChange(e.target.value)}
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
              value={profile.dob}
              onChange={(e) => setProfile(prev => ({ ...prev, dob: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Avatar Options */}
          <div className="form-group">
            <label className="form-label">Choose Avatar</label>
            <div className="avatar-selector">
              <div
                onClick={() => setProfile(prev => ({ ...prev, avatar: 'male' }))}
                className={`avatar-option ${profile.avatar === 'male' ? 'selected' : ''}`}
              >
                <div className="avatar-img-preview">
                  <MaleAvatarSVG />
                </div>
                <span className="avatar-label">Male</span>
              </div>

              <div
                onClick={() => setProfile(prev => ({ ...prev, avatar: 'female' }))}
                className={`avatar-option ${profile.avatar === 'female' ? 'selected' : ''}`}
              >
                <div className="avatar-img-preview">
                  <FemaleAvatarSVG />
                </div>
                <span className="avatar-label">Female</span>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="form-group">
            <label className="form-label">Preferred Response Language</label>
            <select
              value={profile.language}
              onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
              className="form-input"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-btn cancel">
              Cancel
            </button>
            <button type="submit" className="modal-btn save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
