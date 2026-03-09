import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import LeasePDFModal from './modals/LeasePDFModal';
import ManagerDetailsModal from './modals/ManagerDetailsModal';
import NewMaintenanceRequestModal from './modals/NewMaintenanceRequestModal';
import './Tenantdashboard.css';

const TenantDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats('tenant');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusMap = {
    'Pending': 'status-pending',
    'In Progress': 'status-in-progress',
    'Resolved': 'status-resolved',
    'Closed': 'status-resolved'
  };

  return (
    <div className="tenant-dashboard">
      <div className="welcome-banner">
        <h2 className="welcome-title">Welcome Home! 👋</h2>
        <p className="welcome-subtitle">
          {loading ? 'Loading...' : data
            ? `${data.propertyName}${data.unit ? ` ${data.unit}` : ''} • ${data.daysUntilExpiry !== null ? `Lease expires in ${data.daysUntilExpiry} days` : 'Active tenant'}`
            : 'Your rental dashboard'
          }
        </p>
      </div>

      <div className="tenant-main-grid">
        <div className="tenant-left-col">
          <div className="tenant-stats-grid">
            <div className="tenant-stat-card">
              <p className="tenant-stat-label">Next Payment</p>
              <h3 className="tenant-stat-value">${(data?.rentAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="tenant-stat-info tenant-stat-success">
                <span>🗓️</span> Due on {data?.nextDueDate || '—'}
              </p>
            </div>
            <div className="tenant-stat-card">
              <p className="tenant-stat-label">Security Deposit</p>
              <h3 className="tenant-stat-value">${(data?.securityDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="tenant-stat-info">
                <span>🔒</span> Held in Escrow
              </p>
            </div>
          </div>

          <div className="maintenance-card">
            <div className="maintenance-header">
              <h3 className="maintenance-title">My Requests</h3>
              <button className="new-request-btn" onClick={() => setShowNewRequestModal(true)}>+ New Request</button>
            </div>
            {loading ? (
              <p style={{ color: '#94a3b8', fontSize: '14px', padding: '12px 0' }}>Loading...</p>
            ) : data?.myRequests?.length > 0 ? (
              data.myRequests.map((req, i) => (
                <div key={i} className="maintenance-item">
                  <div className="maintenance-icon">🛠️</div>
                  <div className="maintenance-content">
                    <h4 className="maintenance-item-title">{req.title}</h4>
                    <p className="maintenance-item-meta">Submitted {req.date}{req.location ? ` • ${req.location}` : ''}</p>
                  </div>
                  <div className="maintenance-status">
                    <span className={`status-badge ${statusMap[req.status] || 'status-pending'}`}>{req.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px', padding: '12px 0' }}>No maintenance requests yet</p>
            )}
          </div>
        </div>

        <div className="tenant-right-col">
          <div className="actions-card">
            <h3 className="actions-title">Resident Actions</h3>
            <div className="actions-list">
              <button className="action-btn action-btn-primary" onClick={() => onNavigate && onNavigate('account')}>
                Pay Rent Now
              </button>
              <button className="action-btn action-btn-secondary" onClick={() => setShowLeaseModal(true)}>
                View Lease PDF
              </button>
              <button className="action-btn action-btn-secondary" onClick={() => setShowManagerModal(true)}>
                Contact Manager
              </button>
            </div>
          </div>

          <div className="ai-tip-card">
            <h3 className="ai-tip-title">
              <span className="ai-tip-icon">✨</span> AI Tip
            </h3>
            <p className="ai-tip-text">
              "To keep your HVAC efficient, change your air filters every 3 months. Stay on top of maintenance requests to ensure timely repairs!"
            </p>
          </div>
        </div>
      </div>

      {showLeaseModal && <LeasePDFModal onClose={() => setShowLeaseModal(false)} />}
      {showManagerModal && <ManagerDetailsModal onClose={() => setShowManagerModal(false)} />}
      {showNewRequestModal && (
        <NewMaintenanceRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={(newRequest) => {
            console.log('New request:', newRequest);
            setShowNewRequestModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TenantDashboard;