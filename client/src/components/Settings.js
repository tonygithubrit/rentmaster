import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Settings.css';

const Settings = ({ userRole, userName, userEmail }) => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [darkMode, setDarkMode] = useState('system');
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [notifPrefs, setNotifPrefs] = useState({
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  paymentReminders: true,
  maintenanceUpdates: true
});


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { (async () => {
    const phone = localStorage.getItem('userPhone') || '';
    setProfileData(prev => ({
      ...prev,
      fullName: userName || '',
      email: userEmail || '',
      phone: phone
    }));

    const savedMode = localStorage.getItem('darkMode') || 'system';
    setDarkMode(savedMode);
    applyDarkMode(savedMode);
    // add inside the useEffect after setDarkMode/applyDarkMode
const userResponse = await api.getCurrentUser();
if (userResponse.status === 'success' && userResponse.data.user.notificationPreferences) {
  setNotifPrefs(userResponse.data.user.notificationPreferences);
}
})();
  }, [userName, userEmail]);

  const applyDarkMode = (mode) => {
    const root = document.documentElement;
    
    if (mode === 'dark') {
      root.classList.add('dark-mode');
    } else if (mode === 'light') {
      root.classList.remove('dark-mode');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    }
  };

  const handleDarkModeChange = (mode) => {
    setDarkMode(mode);
    localStorage.setItem('darkMode', mode);
    applyDarkMode(mode);
  };

  const handleNotifToggle = async (key) => {
  const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
  setNotifPrefs(updated);
  await api.updateNotificationPreferences(updated);
};

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (darkMode === 'system') {
        applyDarkMode('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode]);

  // Universal phone validation - allows numbers, spaces, +, -, (, )
  const validatePhone = (value) => {
    return value.replace(/[^0-9\s\+\-\(\)]/g, '');
  };

const handleSaveProfile = async () => {
  if (!profileData.fullName.trim()) return alert('Please enter your name');
  if (!profileData.email.trim()) return alert('Please enter your email');

  const phoneDigits = profileData.phone.replace(/\D/g, '');
  if (profileData.phone && phoneDigits.length < 7) return alert('Please enter a valid phone number');

  if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword)
    return alert('Passwords do not match');
  if (profileData.newPassword && profileData.newPassword.length < 6)
    return alert('Password must be at least 6 characters');

  try {
    // Update name and phone
    const profileRes = await api.updateProfile({
      name: profileData.fullName,
      phone: profileData.phone
    });
    if (profileRes.status !== 'success') return alert('Error: ' + profileRes.message);

    // Change password if provided
    if (profileData.newPassword) {
      if (!profileData.currentPassword) return alert('Please enter your current password');
      const passRes = await api.changePassword({
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      });
      if (passRes.status !== 'success') return alert('Password error: ' + passRes.message);
    }

    // Change email if changed
    if (profileData.email !== userEmail) {
      const emailRes = await api.changeEmail(profileData.email);
      if (emailRes.status !== 'success') return alert('Email error: ' + emailRes.message);
      alert('✅ Profile updated! Your email has changed — please verify your new email.');
    } else {
      alert('✅ Profile updated successfully!');
    }

    setEditing(false);
    setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    localStorage.setItem('userName', profileData.fullName);
    if (profileData.email !== userEmail) localStorage.setItem('userEmail', profileData.email);
    localStorage.setItem('userPhone', profileData.phone);

  } catch (err) {
    console.error('Error saving profile:', err);
    alert('Failed to save profile');
  }
};

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          <span>Profile</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <span className="tab-icon">🎨</span>
          <span>Appearance</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">🔔</span>
          <span>Notifications</span>
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">Profile Information</h3>
              {!editing && (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            <div className="profile-grid">
              <div className="avatar-section">
                <div className="user-avatar-large">
                  {profileData.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="avatar-info">
                  <h4 className="avatar-name">{profileData.fullName}</h4>
                  <p className="avatar-role">{userRole}</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editing}
                  />
                  {editing && (
                    <span className="form-hint">
                      Changing email will require re-verification
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: validatePhone(e.target.value) })}
                    disabled={!editing}
                    placeholder="+1 555-123-4567"
                  />
                  {editing && (
                    <span className="form-hint">
                      International format accepted (e.g., +1 555-123-4567)
                    </span>
                  )}
                </div>

                {editing && (
                  <>
                    <div className="divider"></div>
                    <h4 className="subsection-title">Change Password (Optional)</h4>

                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-input"
                          value={profileData.newPassword}
                          onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-input"
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                          placeholder="Re-enter password"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editing && (
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                    <button className="cancel-btn" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="settings-section">
            <h3 className="section-title">Appearance</h3>
            <p className="section-description">
              Customize how RentMaster looks on your device
            </p>

            <div className="theme-options">
              <div
                className={`theme-option ${darkMode === 'light' ? 'selected' : ''}`}
                onClick={() => handleDarkModeChange('light')}
              >
                <div className="theme-preview light-preview">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-box"></div>
                    <div className="preview-box"></div>
                  </div>
                </div>
                <div className="theme-info">
                  <span className="theme-icon">☀️</span>
                  <div>
                    <h4 className="theme-name">Light</h4>
                    <p className="theme-desc">Clean and bright</p>
                  </div>
                  {darkMode === 'light' && <span className="check-icon">✓</span>}
                </div>
              </div>

              <div
                className={`theme-option ${darkMode === 'dark' ? 'selected' : ''}`}
                onClick={() => handleDarkModeChange('dark')}
              >
                <div className="theme-preview dark-preview">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-box"></div>
                    <div className="preview-box"></div>
                  </div>
                </div>
                <div className="theme-info">
                  <span className="theme-icon">🌙</span>
                  <div>
                    <h4 className="theme-name">Dark</h4>
                    <p className="theme-desc">Easy on the eyes</p>
                  </div>
                  {darkMode === 'dark' && <span className="check-icon">✓</span>}
                </div>
              </div>

              <div
                className={`theme-option ${darkMode === 'system' ? 'selected' : ''}`}
                onClick={() => handleDarkModeChange('system')}
              >
                <div className="theme-preview system-preview">
                  <div className="preview-split">
                    <div className="preview-half light-preview">
                      <div className="preview-header"></div>
                      <div className="preview-box"></div>
                    </div>
                    <div className="preview-half dark-preview">
                      <div className="preview-header"></div>
                      <div className="preview-box"></div>
                    </div>
                  </div>
                </div>
                <div className="theme-info">
                  <span className="theme-icon">💻</span>
                  <div>
                    <h4 className="theme-name">System</h4>
                    <p className="theme-desc">Follows device settings</p>
                  </div>
                  {darkMode === 'system' && <span className="check-icon">✓</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3 className="section-title">Notification Preferences</h3>
            <p className="section-description">
              Choose what updates you want to receive
            </p>

            <div className="notification-options">
              <div className="notification-item">
                <div className="notification-info">
                  <h4 className="notification-name">📧 Email Notifications</h4>
                  <p className="notification-desc">Receive updates via email</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs.emailNotifications} onChange={() => handleNotifToggle('emailNotifications')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4 className="notification-name">💬 SMS Notifications</h4>
                  <p className="notification-desc">Get text message alerts</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs.smsNotifications} onChange={() => handleNotifToggle('smsNotifications')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4 className="notification-name">🔔 Push Notifications</h4>
                  <p className="notification-desc">Browser notifications</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs.pushNotifications} onChange={() => handleNotifToggle('pushNotifications')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4 className="notification-name">💰 Payment Reminders</h4>
                  <p className="notification-desc">Rent due date reminders</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs.paymentReminders} onChange={() => handleNotifToggle('paymentReminders')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="notification-item">
                <div className="notification-info">
                  <h4 className="notification-name">🛠️ Maintenance Updates</h4>
                  <p className="notification-desc">Request status changes</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs.maintenanceUpdates} onChange={() => handleNotifToggle('maintenanceUpdates')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;