import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto-close menu when resizing to desktop
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const landlordItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'properties', label: 'Properties', icon: '🏠' },
    { id: 'tenants', label: 'Tenants', icon: '👥' },
    { id: 'agents', label: 'Property Managers', icon: '🤝' },
    { id: 'maintenance', label: 'Maintenance', icon: '🛠️' },
    { id: 'payments', label: 'Payments', icon: '💰' }, 
    { id: 'ai-tools', label: 'AI Insights', icon: '✨' },
    { id: 'account', label: 'Account', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const tenantItems = [
    { id: 'dashboard', label: 'My Home', icon: '🏠' },
    { id: 'maintenance', label: 'Support', icon: '🛠️' },
    { id: 'payments', label: 'Payments', icon: '💰' }, 
    { id: 'ai-tools', label: 'Smart Living', icon: '✨' },
    { id: 'account', label: 'Rent', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const agentItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'properties', label: 'Listings', icon: '🏠' },
  { id: 'tenants', label: 'Tenants', icon: '👥' },
  { id: 'maintenance', label: 'Maintenance', icon: '🛠️' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'ai-tools', label: 'Market AI', icon: '✨' },
  { id: 'account', label: 'Account', icon: '💳' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

  const getItems = () => {
    if (userRole === 'landlord') return landlordItems;
    if (userRole === 'tenant') return tenantItems;
    return agentItems;
  };

  const navItems = getItems();

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    // Close mobile menu after clicking
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>

        <div className="sidebar-header">
          <h1 className="sidebar-title">
            🏘️ <span className="brand-rent">Rent</span>Master
          </h1>
          <div className="sidebar-badge">{userRole}</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <div className="copyright">
            © 2024 RentMaster
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
