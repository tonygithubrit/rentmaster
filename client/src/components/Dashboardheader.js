import React, { useState, useEffect, useRef } from 'react';
import './Dashboardheader.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DashboardHeader = ({ userRole, userName, userEmail, onSearch, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        const notifs = (data.data.notifications || []).map(n => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          time: timeAgo(n.createdAt),
          read: n.isRead,
         icon: n.type === 'rent_payment_pending' ? '💰' 
        : n.type === 'security_deposit_pending' ? '🔒' 
        : n.type === 'maintenance_request' ? '🔧'
        : '🤝'
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };
  fetchNotifications();

  const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return '1 day ago';
  return `${Math.floor(seconds / 86400)} days ago`;
};
}, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return userRole.charAt(0).toUpperCase();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format role for display
  const getRoleDisplay = () => {
    return `${userRole.charAt(0).toUpperCase()}${userRole.slice(1)} Account`;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Call parent component's search handler
      if (onSearch) {
        onSearch(searchQuery);
      }
      console.log('Searching for:', searchQuery);
    }
  };

  // Handle real-time search as user types
  const handleSearchChange = (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  
  clearTimeout(window.searchTimeout);
  if (query.trim()) {
    window.searchTimeout = setTimeout(() => {
      onSearch(query);
    }, 300);
  } else {
    setSearchQuery('');
    onSearch('');
  }
};

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark notification as read
  const markAsRead = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.error('Failed to mark as read:', err);
  }
  setNotifications(notifications.map(notif => 
    notif.id === id ? { ...notif, read: true } : notif
  ));
  setUnreadCount(prev => Math.max(0, prev - 1));
};

  // Mark all as read
  const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    await Promise.all(
      notifications.filter(n => !n.read).map(n =>
        fetch(`${API_URL}/notifications/${n.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      )
    );
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
  setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  setUnreadCount(0);
};

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        {/* Search Bar */}
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Quick search..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>

        {/* User Info Section */}
        <div className="user-section">
          {/* Notifications Bell */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className="notification-btn"
              onClick={toggleNotifications}
            >
              <span className="bell-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3 className="notifications-title">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read-btn"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <span className="no-notif-icon">🔕</span>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                          // Navigate based on notification type
                        if (notif.type === 'maintenance_request') {
                          onNavigate('maintenance');
                        } else {
                          onNavigate('payments');
                        }
                      }}
>
                        <div className="notif-icon">{notif.icon}</div>
                        <div className="notif-content">
                          <div className="notif-title">{notif.title}</div>
                          <div className="notif-message">{notif.message}</div>
                          <div className="notif-time">{notif.time}</div>
                        </div>
                        {!notif.read && <div className="unread-dot"></div>}
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notifications-footer">
                    <button 
                      className="clear-all-btn"
                      onClick={clearAll}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{userName || 'User'}</div>
              <div className="user-role">{getRoleDisplay()}</div>
            </div>
            <div className="user-avatar">
              {getInitials(userName)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
