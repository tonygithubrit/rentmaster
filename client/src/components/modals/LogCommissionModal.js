import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const LogCommissionModal = ({ onClose, onSubmit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    paymentPeriodMonth: new Date().getMonth() + 1,
    paymentPeriodYear: new Date().getFullYear(),
    status: 'Completed',
    notes: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      // Get agent's assigned properties
      const response = await api.getProperties();
      if (response.status === 'success') {
        setProperties(response.data.properties || []);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Logging commission:', formData);

      const selectedProperty = properties.find(p => p._id === formData.propertyId);
      
      if (!selectedProperty) {
        setError('Please select a property');
        setLoading(false);
        return;
      }

      // Get current user info
      const userResponse = await api.getCurrentUser();
      const currentUser = userResponse.data.user;

      const commissionData = {
        tenantId: currentUser._id, // Agent is the recipient
        tenantName: currentUser.name,
        propertyId: formData.propertyId,
        propertyName: selectedProperty.name,
        landlordId: selectedProperty.landlordId._id || selectedProperty.landlordId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        paymentType: 'Commission',
        referenceNumber: formData.referenceNumber,
        paymentPeriod: {
          month: parseInt(formData.paymentPeriodMonth),
          year: parseInt(formData.paymentPeriodYear)
        },
        status: formData.status,
        notes: formData.notes
      };

      const response = await api.createPayment(commissionData);
      console.log('📡 Create commission response:', response);

      if (response.status === 'success') {
        console.log('✅ Commission logged successfully');
        alert('Commission logged successfully!');
        if (onSubmit) onSubmit(response.data.payment);
        onClose();
      } else {
        setError(response.message || 'Failed to log commission');
        alert('Error: ' + (response.message || 'Failed to log commission'));
      }
    } catch (err) {
      console.error('❌ Error logging commission:', err);
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
          <h2>Log Commission Received</h2>
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
              <label>Property <span className="required">*</span></label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select property...</option>
                {properties.map(property => (
                  <option key={property._id} value={property._id}>
                    {property.name} - {property.address}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <small style={{color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                  No properties assigned to you
                </small>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Commission Amount ($) <span className="required">*</span></label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="500"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

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
            </div>

            <div className="form-row-2">
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
                  <option value="Mobile Payment">Mobile Payment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="TXN123456"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>For Month</label>
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

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional commission details..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="info-box success">
              <strong>✓ Commission Record:</strong> This will log the commission payment. The landlord will see this in their payment records.
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading || properties.length === 0}>
                {loading ? '⏳ Logging...' : '✓ Log Commission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogCommissionModal;