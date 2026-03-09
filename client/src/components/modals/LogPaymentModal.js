import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const LogPaymentModal = ({ onClose, onSubmit }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    paymentType: 'Rent',
    referenceNumber: '',
    paymentPeriodMonth: new Date().getMonth() + 1,
    paymentPeriodYear: new Date().getFullYear(),
    status: 'Completed',
    notes: ''
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await api.getTenants();
      if (response.status === 'success') {
        // Only show active tenants
        const activeTenants = response.data.tenants.filter(t => t.status === 'Active');
        setTenants(activeTenants);
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError('Failed to load tenants');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill amount and property when tenant is selected
    if (name === 'tenantId') {
      const selectedTenant = tenants.find(t => t._id === value);
      if (selectedTenant) {
        setFormData({ 
          ...formData, 
          tenantId: value,
          propertyId: selectedTenant.propertyId._id || selectedTenant.propertyId,
          amount: selectedTenant.monthlyRent || ''
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Logging payment:', formData);

      const paymentData = {
        tenantId: formData.tenantId,
        propertyId: formData.propertyId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
        referenceNumber: formData.referenceNumber,
        paymentPeriod: {
          month: parseInt(formData.paymentPeriodMonth),
          year: parseInt(formData.paymentPeriodYear)
        },
        status: formData.status,
        notes: formData.notes
      };

      const response = await api.createPayment(paymentData);
      console.log('📡 Create payment response:', response);

      if (response.status === 'success') {
        console.log('✅ Payment logged successfully');
        alert('Payment logged successfully!');
        if (onSubmit) onSubmit(response.data.payment);
        onClose();
      } else {
        setError(response.message || 'Failed to log payment');
        alert('Error: ' + (response.message || 'Failed to log payment'));
      }
    } catch (err) {
      console.error('❌ Error logging payment:', err);
      setError('Failed to connect to server');
      alert('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Payment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message" style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              ❌ {error}
            </div>
          )}

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tenant <span className="required">*</span></label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select a tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} - {tenant.propertyId?.name || tenant.propertyName}
                  </option>
                ))}
              </select>
              {tenants.length === 0 && (
                <small style={{color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                  No active tenants available
                </small>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Payment Type <span className="required">*</span></label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Rent">Rent</option>
                  <option value="Security Deposit">Security Deposit</option>
                  <option value="Late Fee">Late Fee</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount ($) <span className="required">*</span></label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Payment Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Payment Method <span className="required">*</span></label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Payment Period - Month</label>
                <select
                  name="paymentPeriodMonth"
                  value={formData.paymentPeriodMonth}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  name="paymentPeriodYear"
                  value={formData.paymentPeriodYear}
                  onChange={handleChange}
                  min="2020"
                  max="2030"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Reference/Confirmation Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="TXN123456"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional payment details..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="info-box success">
              <strong>✓ Payment Record:</strong> This will log the payment in your records. The tenant will not be automatically notified.
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading || tenants.length === 0}>
                {loading ? '⏳ Logging...' : '✓ Log Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogPaymentModal;