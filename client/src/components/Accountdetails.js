import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Accountdetails.css';

const AccountDetails = ({ userRole, userName, userEmail }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  

  // Own bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    paymentNote: ''
  });

  // For viewing landlord/agent bank details
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [commissionRate, setCommissionRate] = useState(5);

  useEffect(() => {
    loadAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load own user data
      const userResponse = await api.getCurrentUser();
      if (userResponse.status === 'success') {
        const user = userResponse.data.user;
        
        // Set own bank details
        if (user.bankDetails) {
          setBankDetails(user.bankDetails);
        }

        // Set commission rate for agents
        if (user.commissionRate !== undefined) {
          setCommissionRate(user.commissionRate);
        }
      }

      // Load recipient details based on role
      if (userRole === 'tenant') {
        // Tenant loads landlord's bank details
        const landlordResponse = await api.getLandlordBankDetails();
        if (landlordResponse.status === 'success') {
          setRecipientDetails({
            type: 'Landlord',
            ...landlordResponse.data.landlord
          });
        }
      } else if (userRole === 'landlord') {
        // Landlord can load agent details (we'll add a selector later if needed)
        // For now, we'll skip this - landlords see agent details when assigning properties
        setRecipientDetails(null);
      }

    } catch (err) {
      console.error('Error loading account data:', err);
      setError('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({
      ...bankDetails,
      [name]: value
    });
  };

  const handleSaveBankDetails = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        bankDetails,
        ...(userRole === 'agent' && { commissionRate })
      };

      const response = await api.updateProfile(updateData);
      
      if (response.status === 'success') {
        alert('Bank details updated successfully!');
        setEditing(false);
        await loadAccountData();
      } else {
        setError(response.message || 'Failed to update bank details');
        alert('Error: ' + (response.message || 'Failed to update'));
      }
    } catch (err) {
      console.error('Error saving bank details:', err);
      setError('Failed to save bank details');
      alert('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    alert(`${field} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="account-details">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error && !bankDetails.bankName) {
    return (
      <div className="account-details">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Account Details</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAccountData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-details">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Account Details</h2>
          <p className="page-subtitle">Manage your payment information</p>
        </div>
      </div>

      {/* Own Bank Details Section */}
      <div className="details-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {userRole === 'landlord' && '💰 Your Payment Details (For Receiving Rent)'}
              {userRole === 'tenant' && '💳 Your Payment Method'}
              {userRole === 'agent' && '💰 Your Payment Details (For Receiving Commissions)'}
            </h3>
            <p className="card-subtitle">
              {userRole === 'landlord' && 'Share these details with tenants to receive rent payments'}
              {userRole === 'tenant' && 'Your payment method for rent payments'}
              {userRole === 'agent' && 'Landlords will use these details to pay your commissions'}
            </p>
          </div>
          {!editing && userRole !== 'tenant' && (
            <button className="edit-btn" onClick={() => setEditing(true)}>
             ✏️ Edit
            </button>
          )}
        </div>

        {editing ? (
          // Edit Mode
          <div className="edit-form">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleBankDetailsChange}
                placeholder="e.g., Chase Bank"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Account Name</label>
              <input
                type="text"
                name="accountName"
                value={bankDetails.accountName}
                onChange={handleBankDetailsChange}
                placeholder="e.g., John Doe"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
                placeholder="1234567890"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Routing Number</label>
              <input
                type="text"
                name="routingNumber"
                value={bankDetails.routingNumber}
                onChange={handleBankDetailsChange}
                placeholder="123456789"
                disabled={saving}
              />
            </div>

            {userRole === 'agent' && (
              <div className="form-group">
                <label>Commission Rate (%)</label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={saving}
                />
              </div>
            )}

            <div className="form-group">
              <label>Payment Note</label>
              <textarea
                name="paymentNote"
                value={bankDetails.paymentNote}
                onChange={handleBankDetailsChange}
                placeholder="e.g., Please include apartment number in payment description"
                rows="3"
                disabled={saving}
              />
            </div>

            <div className="form-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveBankDetails}
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '✓ Save Details'}
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="details-view">
            {!bankDetails.bankName ? (
              userRole !== 'tenant' && (
              <div className="empty-details">
                <p>No payment details added yet.</p>
                <button className="add-btn" onClick={() => setEditing(true)}>
                  + Add Payment Details
                </button>
              </div>
              )
            ) : (
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Bank Name</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{bankDetails.bankName}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Account Name</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{bankDetails.accountName}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Account Number</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{bankDetails.accountNumber}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(bankDetails.accountNumber, 'Account number')}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Routing Number</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{bankDetails.routingNumber}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(bankDetails.routingNumber, 'Routing number')}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {userRole === 'agent' && (
                  <div className="detail-item">
                    <span className="detail-label">Commission Rate</span>
                    <span className="detail-value">{commissionRate}%</span>
                  </div>
                )}

                {bankDetails.paymentNote && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Payment Note</span>
                    <span className="detail-value">{bankDetails.paymentNote}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipient Details Section (Tenant sees Landlord, Landlord sees Agent) */}
      {recipientDetails && (
        <div className="details-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {recipientDetails.type === 'Landlord' && '🏠 Landlord Payment Details'}
                {recipientDetails.type === 'Agent' && '🤝 Property Manager Payment Details'}
              </h3>
              <p className="card-subtitle">
                {recipientDetails.type === 'Landlord' && 'Use these details to pay your rent'}
                {recipientDetails.type === 'Agent' && 'Use these details to pay Property Manager commissions'}
              </p>
            </div>
          </div>

          <div className="details-view">
            <div className="info-box">
              <strong>{recipientDetails.type}:</strong> {recipientDetails.name} ({recipientDetails.email})
            </div>

            {recipientDetails.bankDetails ? (
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Bank Name</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{recipientDetails.bankDetails.bankName}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Account Name</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{recipientDetails.bankDetails.accountName}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Account Number</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{recipientDetails.bankDetails.accountNumber}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(recipientDetails.bankDetails.accountNumber, 'Account number')}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Routing Number</span>
                  <div className="detail-value-row">
                    <span className="detail-value">{recipientDetails.bankDetails.routingNumber}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => handleCopy(recipientDetails.bankDetails.routingNumber, 'Routing number')}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {recipientDetails.commissionRate !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label">Commission Rate</span>
                    <span className="detail-value">{recipientDetails.commissionRate}%</span>
                  </div>
                )}

                {recipientDetails.bankDetails.paymentNote && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Payment Note</span>
                    <span className="detail-value">{recipientDetails.bankDetails.paymentNote}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-details">
                <p>No payment details available from {recipientDetails.type.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tenant Payment Action */}
      {userRole === 'tenant' && recipientDetails && recipientDetails.bankDetails && (
        <div className="details-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">💳 Make Payment</h3>
              <p className="card-subtitle">Notify your landlord after making a rent payment</p>
            </div>
          </div>

          <div className="details-view">
            <PaymentNotificationForm landlordDetails={recipientDetails} />
          </div>
        </div>
      )}
    </div>
  );
};

// New component for payment notification form
// Simplified Payment Notification Form
const PaymentNotificationForm = ({ landlordDetails }) => {
  const [formData, setFormData] = useState({
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Bank Transfer',
  referenceNumber: '',
  paymentType: 'Rent'
});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptName, setReceiptName] = useState('');

  const handleReceiptChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onloadend = () => {
    setReceipt({
      data: reader.result.split(',')[1], // base64 only
      mimeType: file.type,
      fileName: file.name
    });
    setReceiptName(file.name);
  };
  reader.readAsDataURL(file);
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
const response = await api.notifyPaymentMade({
  amount: parseFloat(formData.amount),
  paymentDate: formData.paymentDate,
  paymentMethod: formData.paymentMethod,
  referenceNumber: formData.referenceNumber,
  paymentType: formData.paymentType,
  paymentPeriod: {
    month: new Date(formData.paymentDate).getMonth() + 1,
    year: new Date(formData.paymentDate).getFullYear()
  },
  receiptImage: receipt || null
});

      if (response.status === 'success') {
        alert('✅ Payment notification sent to your landlord!');
        // Reset form
        setFormData({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Bank Transfer',
          referenceNumber: ''
        });
        setReceipt(null);
        setReceiptName('');
      } else {
        alert('❌ Error: ' + (response.message || 'Failed to send notification'));
      }
    } catch (err) {
      console.error('Error notifying payment:', err);
      alert('❌ Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
      <div style={{display: 'grid', gap: '16px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <div style={{marginBottom: '16px'}}>
  <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
    Payment Type <span style={{color: '#ef4444'}}>*</span>
  </label>
  <select
    name="paymentType"
    value={formData.paymentType}
    onChange={handleChange}
    required
    disabled={submitting}
    style={{padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%'}}
  >
    <option value="Rent">Rent Payment</option>
    <option value="Security Deposit">Security Deposit</option>
  </select>
</div>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
              Amount Paid ($) <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="2500"
              required
              min="0"
              step="0.01"
              disabled={submitting}
              style={{
                // width: '100%',
                padding: '10px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
              Payment Date <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              disabled={submitting}
              style={{
                // width: '100%',
                padding: '10px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
              Payment Method <span style={{color: '#ef4444'}}>*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              disabled={submitting}
              style={{
                // width: '100%',
                padding: '10px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Mobile Payment">Mobile Payment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
              Reference Number
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="TXN123456"
              disabled={submitting}
              style={{
                // width: '100%',
                padding: '10px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#334155'}}>
            Upload Receipt <span style={{color: '#94a3b8', fontWeight: '400'}}>(optional)</span>
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', border: '2px dashed #e2e8f0',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#64748b'
          }}>
            <span>📎</span>
            <span>{receiptName || 'Click to attach receipt (image or PDF)'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceiptChange}
              disabled={submitting}
              style={{display: 'none'}}
            />
          </label>
        </div>

        <div style={{
          background: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <strong>ℹ️ Note:</strong> This will notify {landlordDetails.name} that you've made the payment. They will confirm once received.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{
            background: submitting ? '#94a3b8' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {submitting ? '⏳ Sending...' : '✓ I\'ve Made Payment'}
        </button>
      </div>
    </form>
  );
};

export default AccountDetails;