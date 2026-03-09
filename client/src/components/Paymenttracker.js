import React, { useState, useEffect } from 'react';
import LogPaymentModal from './modals/LogPaymentModal';
import LogCommissionModal from './modals/LogCommissionModal';
import { api } from '../utils/api';
import './Paymenttracker.css';

const PaymentTracker = ({ userRole }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  useEffect(() => {
    loadPayments();
    loadNotifications();
    if (userRole === 'landlord') {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  useEffect(() => {
    filterPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, filterStatus, filterType]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching payments from backend...');
      
      const response = await api.getPayments();
      console.log('📦 Payments response:', response);
      
      if (response && response.status === 'success' && response.data) {
        setPayments(response.data.payments || []);
        console.log('✅ Payments loaded:', response.data.payments?.length || 0);
      } else {
        const errorMsg = response?.message || 'Failed to load payments';
        setError(errorMsg);
        console.error('❌ Error:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Error loading payments:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
  try {
    // For agents, load both pending and confirmed notifications
    // For landlords, only load pending
    let response;
    if (userRole === 'agent') {
      // Agent needs to see confirmed notifications too (to confirm receipt)
      const pendingResponse = await api.getNotifications('pending');
      const confirmedResponse = await api.getNotifications('confirmed');
      
      const pendingNotifs = pendingResponse.status === 'success' ? pendingResponse.data.notifications : [];
      const confirmedNotifs = confirmedResponse.status === 'success' ? confirmedResponse.data.notifications : [];
      
      // Combine and filter only commission notifications without paymentId
      const allNotifs = [...pendingNotifs, ...confirmedNotifs].filter(n => 
        n.type === 'commission_payment_pending' && !n.paymentId
      );
      
      setNotifications(allNotifs);
    } else {
     // Landlords only see pending notifications
response = await api.getNotifications('pending');
if (response.status === 'success') {
  const notifs = (response.data.notifications || []).filter(n => 
    n.type !== 'maintenance_request'
  );
  setNotifications(notifs);
}
    }
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
};

  const loadStats = async () => {
    try {
      const response = await api.getPaymentStats();
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

 const filterPayments = () => {
  let filtered = [...payments];

  // Agent-specific filter: Only show commission payments
  if (userRole === 'agent') {
    filtered = filtered.filter(p => p.paymentType === 'Commission');
  }

  if (filterStatus !== 'all') {
    filtered = filtered.filter(p => p.status === filterStatus);
  }

  if (filterType !== 'all') {
    filtered = filtered.filter(p => p.paymentType === filterType);
  }

  setFilteredPayments(filtered);
};

  const handleConfirmRent = async (notification) => {
  const paymentLabel = notification.paymentData.paymentType === 'Security Deposit' ? 'security deposit' : 'rent payment';
  if (!window.confirm(`Confirm ${paymentLabel} of $${(notification.paymentData.amount || 0).toLocaleString()} from ${notification.paymentData.tenantName}?`)) {
      return;
    }

    try {
      const response = await api.confirmRentPayment(notification._id);
      
      if (response.status === 'success') {
        alert('✅ Payment confirmed and logged!');
        await loadPayments();
        await loadNotifications();
        await loadStats();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (err) {
      console.error('Error confirming rent:', err);
      alert('Failed to confirm payment');
    }
  };

  const handleConfirmCommission = async (notification) => {
    if (!window.confirm(`Confirm you've paid commission of $${(notification.paymentData.amount || 0).toLocaleString()} to ${notification.paymentData.agentName}?`)) {
      return;
    }

    try {
      const response = await api.confirmCommissionPayment(notification._id);
      
      if (response.status === 'success') {
        alert('✅ Commission payment confirmed! Property Manager will be notified.');
        await loadNotifications();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (err) {
      console.error('Error confirming commission:', err);
      alert('Failed to confirm commission');
    }
  };

  const handleAgentConfirm = async (notification) => {
    if (!window.confirm(`Confirm you've received commission of $${(notification.paymentData.amount || 0).toLocaleString()}?`)) {
      return;
    }

    try {
      const response = await api.agentConfirmCommission(notification._id);
      
      if (response.status === 'success') {
        alert('✅ Commission receipt confirmed and logged!');
        await loadPayments();
        await loadNotifications();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (err) {
      console.error('Error confirming commission:', err);
      alert('Failed to confirm');
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Are you sure you want to delete this payment record?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting payment:', payment._id);
      const response = await api.deletePayment(payment._id);
      
      if (response.status === 'success') {
        console.log('✅ Payment deleted successfully');
        await loadPayments();
        if (userRole === 'landlord') {
          await loadStats();
        }
        alert('Payment deleted successfully');
      } else {
        alert('Failed to delete payment: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error deleting payment:', err);
      alert('Failed to delete payment');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Completed': 'status-completed',
      'Pending': 'status-pending',
      'Failed': 'status-failed'
    };
    return statusMap[status] || 'status-default';
  };

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      'Rent': 'type-rent',
      'Security Deposit': 'type-deposit',
      'Late Fee': 'type-late',
      'Maintenance': 'type-maintenance',
      'Commission': 'type-commission',
      'Other': 'type-other'
    };
    return typeMap[type] || 'type-default';
  };

 // Calculate totals - Role-specific
const totalRevenue = (() => {
  const completedPayments = payments.filter(p => p.status === 'Completed');
  
  if (userRole === 'agent') {
    // Agent: Only commission payments
    return completedPayments
      .filter(p => p.paymentType === 'Commission')
      .reduce((sum, p) => sum + p.amount, 0);
  } else if (userRole === 'tenant') {
    // Tenant: Only their rent payments (already filtered by backend)
    return completedPayments.reduce((sum, p) => sum + p.amount, 0);
  } else {
    // Landlord: All payments
    return completedPayments.reduce((sum, p) => sum + p.amount, 0);
  }
})();

const pendingAmount = (() => {
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  
  if (userRole === 'agent') {
    // Agent: Only pending commissions
    return pendingPayments
      .filter(p => p.paymentType === 'Commission')
      .reduce((sum, p) => sum + p.amount, 0);
  } else if (userRole === 'tenant') {
    // Tenant: Their pending rent payments
    return pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  } else {
    // Landlord: All pending payments
    return pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  }
})();

  // Loading state
  if (loading) {
    return (
      <div className="payment-tracker">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="payment-tracker">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Payments</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadPayments}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-tracker">
      <div className="page-header">
  <div className="header-left">
    <h2 className="page-title">Payment Tracker</h2>
    <p className="page-subtitle">Track rent and payment history</p>
  </div>
  {userRole === 'landlord' && (
    <button className="add-btn" onClick={() => setShowLogModal(true)}>
      + Log Payment
    </button>
  )}
  {userRole === 'agent' && (
    <button className="add-btn" onClick={() => setShowCommissionModal(true)}>
      + Log Commission
    </button>
  )}
</div>

{/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          <h3 className="notifications-title">
            🔔 Pending Confirmations ({notifications.length})
          </h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification._id} className="notification-card">
                <div className="notification-info">
                  <div className="notification-main">
                    <span className="notification-type-icon">
                      {notification.type === 'rent_payment_pending' ? '💰' : notification.type === 'security_deposit_pending' ? '🔒' : '💼'}
                    </span>
                    <div className="notification-text">
                      <strong>{notification.paymentData.tenantName || notification.paymentData.agentName}</strong>
                      <span className="notification-amount">${(notification.paymentData.amount || 0).toLocaleString()}</span>
                      <span className="notification-property">• {notification.paymentData.propertyName}</span>
                    </div>
                  </div>
                  <div className="notification-meta">
                    <span>{new Date(notification.paymentData.paymentDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{notification.paymentData.paymentMethod}</span>
                    {notification.paymentData.referenceNumber && (
                      <>
                        <span>•</span>
                        <span>{notification.paymentData.referenceNumber}</span>
                      </>
                    )}
                  </div>
                </div>
                {notification.paymentData.receiptImage && (
                   <div style={{marginTop: '8px'}}>
                     {notification.paymentData.receiptImage.mimeType === 'application/pdf' ? (
                       <a
                         href={`data:application/pdf;base64,${notification.paymentData.receiptImage.data}`}
                         download={notification.paymentData.receiptImage.fileName}
                         style={{fontSize: '13px', color: '#3b82f6', textDecoration: 'none'}}
                       >
                         📄 View Receipt ({notification.paymentData.receiptImage.fileName})
                       </a>
                     ) : (
                       <img
                         src={`data:${notification.paymentData.receiptImage.mimeType};base64,${notification.paymentData.receiptImage.data}`}
                         alt="Payment receipt"
                         style={{maxWidth: '200px', maxHeight: '120px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer'}}
                         onClick={() => window.open(`data:${notification.paymentData.receiptImage.mimeType};base64,${notification.paymentData.receiptImage.data}`)}
                       />
                     )}
                   </div>
                 )}
                <div className="notification-action">
                  {(notification.type === 'rent_payment_pending' || notification.type === 'security_deposit_pending') && userRole === 'landlord' && (
                    <button 
                      className="confirm-btn"
                      onClick={() => handleConfirmRent(notification)}
                   >
                       ✓ Confirm Received
                    </button>
                 )}
                  {notification.type === 'commission_payment_pending' && userRole === 'landlord' && notification.status === 'pending' && (
                    <button 
                      className="confirm-btn"
                      onClick={() => handleConfirmCommission(notification)}
                    >
                      ✓ Confirm Paid
                    </button>
                  )}
                  {notification.type === 'commission_payment_pending' && userRole === 'agent' && notification.status === 'confirmed' && (
                    <button 
                      className="confirm-btn agent-confirm"
                      onClick={() => handleAgentConfirm(notification)}
                    >
                      ✓ Confirm Received
                    </button>
                  )}
                  {notification.type === 'commission_payment_pending' && userRole === 'agent' && notification.status === 'pending' && (
                    <div className="waiting-badge">⏳ Waiting for landlord</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards - Landlord Only */}
      {userRole === 'landlord' && stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <p className="stat-label">This Month</p>
              <h3 className="stat-value">${stats.revenueThisMonth.toLocaleString()}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pendingPayments}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

<div className="filter-group">
  <label className="filter-label">Type:</label>
  <select 
    className="filter-select"
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
  >
    <option value="all">All Types</option>
    {userRole !== 'agent' && <option value="Rent">Rent</option>}
    <option value="Commission">Commission</option>
    {userRole !== 'agent' && <option value="Security Deposit">Security Deposit</option>}
    {userRole !== 'agent' && <option value="Late Fee">Late Fee</option>}
    {userRole !== 'agent' && <option value="Maintenance">Maintenance</option>}
    {userRole !== 'agent' && <option value="Other">Other</option>}
  </select>
</div>

        <div className="summary-totals">
          <span className="total-item">
            <strong>Total:</strong> ${totalRevenue.toLocaleString()}
          </span>
          {pendingAmount > 0 && (
            <span className="total-item pending">
              <strong>Pending:</strong> ${pendingAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-list">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No Payments Found</h3>
            <p>
              {filterStatus !== 'all' || filterType !== 'all'
                ? "No payments match your filters"
                : userRole === 'landlord' 
                  ? "Start by logging your first payment"
                  : "No payment records yet"}
            </p>
            {userRole === 'landlord' && (
              <button className="add-btn" onClick={() => setShowLogModal(true)}>
                + Log First Payment
              </button>
            )}
          </div>
        ) : (
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{userRole === 'agent' ? 'From' : 'Tenant/Agent'}</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  {userRole === 'landlord' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>{payment.tenantId?.name || payment.tenantName}</td>
                    <td>{payment.propertyId?.name || payment.propertyName}</td>
                    <td>
                      <span className={`type-badge ${getTypeBadgeClass(payment.paymentType)}`}>
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="amount-cell">${(payment.amount || 0).toLocaleString()}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    {userRole === 'landlord' && (
  <td>
  <button 
    className="delete-btn-small"
    onClick={() => handleDelete(payment)}
    title="Delete payment"
    style={{marginLeft: 'auto', display: 'block', width: 'fit-content'}}
  >
    🗑️
  </button>
</td>
)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Payment Modal */}
      {showLogModal && (
        <LogPaymentModal
          onClose={() => setShowLogModal(false)}
          onSubmit={async () => {
            await loadPayments();
            if (userRole === 'landlord') {
              await loadStats();
            }
            setShowLogModal(false);
          }}
        />
      )}

      {/* Log Commission Modal - Agent */}
{showCommissionModal && (
  <LogCommissionModal
    onClose={() => setShowCommissionModal(false)}
    onSubmit={async () => {
      await loadPayments();
      setShowCommissionModal(false);
    }}
  />
)}
    </div>
  );
};

export default PaymentTracker;