import React from 'react';
import './Modal.css';

const ManagerDetailsModal = ({ onClose }) => {
  // Mock manager data - will come from backend
  const manager = {
    name: 'Sarah Johnson',
    role: 'Property Manager',
    email: 'sarah.johnson@rentmaster.com',
    phone: '(555) 123-4567',
    officePhone: '(555) 100-2000',
    officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    emergencyPhone: '(555) 911-0000',
    address: '123 Main Street, Suite 200, Los Angeles, CA 90001'
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${manager.email}`;
  };

  const handleSMS = () => {
    window.location.href = `sms:${manager.phone}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Contact Property Manager</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Manager Avatar */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px'
            }}>
              SJ
            </div>
            <h3 style={{ 
              margin: '0 0 4px 0', 
              fontSize: '20px',
              color: 'var(--text-primary, #0f172a)'
            }}>
              {manager.name}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '14px',
              color: 'var(--text-secondary, #64748b)',
              fontWeight: 600
            }}>
              {manager.role}
            </p>
          </div>

          {/* Contact Information */}
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">📧 Email</span>
              <span className="details-value">{manager.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">📱 Mobile Phone</span>
              <span className="details-value">{manager.phone}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">☎️ Office Phone</span>
              <span className="details-value">{manager.officePhone}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">🚨 Emergency</span>
              <span className="details-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                {manager.emergencyPhone}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">🕒 Office Hours</span>
              <span className="details-value">{manager.officeHours}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">📍 Office Address</span>
              <span className="details-value">{manager.address}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <button 
              className="btn-primary"
              style={{ padding: '14px 12px' }}
              onClick={() => handleCall(manager.phone)}
            >
              <span style={{ fontSize: '18px' }}>📞</span>
              <span>Call</span>
            </button>
            <button 
              className="btn-primary"
              style={{ padding: '14px 12px' }}
              onClick={handleEmail}
            >
              <span style={{ fontSize: '18px' }}>✉️</span>
              <span>Email</span>
            </button>
            <button 
              className="btn-primary"
              style={{ padding: '14px 12px' }}
              onClick={handleSMS}
            >
              <span style={{ fontSize: '18px' }}>💬</span>
              <span>Text</span>
            </button>
          </div>

          <div className="info-box" style={{ marginTop: '20px' }}>
            <strong>💡 Response Time:</strong> We typically respond to inquiries within 24 hours during business days. For emergencies, please call the emergency hotline.
          </div>

          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDetailsModal;
