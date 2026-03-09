import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const AddTenantModal = ({ onClose, onSubmit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    leaseStart: '',
    leaseEnd: '',
    monthlyRent: '',
    securityDeposit: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.status === 'success') {
        // Only show vacant or maintenance properties
        const availableProperties = response.data.properties.filter(
          p => p.status === 'Vacant' || p.status === 'Maintenance'
        );
        setProperties(availableProperties);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    }
  };

  // Universal phone validation
  const formatPhone = (value) => {
    return value.replace(/[^0-9\s\+\-\(\)]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'emergencyContactPhone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate phone has at least 7 digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      alert('Please enter a valid phone number (minimum 7 digits)');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Creating new tenant:', formData);

      // Prepare tenant data for backend
      const tenantData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId: formData.propertyId,
        leaseStart: formData.leaseStart,
        leaseEnd: formData.leaseEnd,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : 0,
        notes: formData.notes
      };

      // Add emergency contact if provided
      if (formData.emergencyContactName || formData.emergencyContactPhone) {
        tenantData.emergencyContact = {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        };
      }

      const response = await api.createTenant(tenantData);
      console.log('📡 Create tenant response:', response);
      
      if (response.status === 'success') {
        console.log('✅ Tenant created successfully');
        alert('Tenant added successfully!');
        if (onSubmit) onSubmit(response.data.tenant);
        onClose();
      } else {
        setError(response.message || 'Failed to create tenant');
        alert('Error: ' + (response.message || 'Failed to create tenant'));
      }
    } catch (err) {
      console.error('❌ Error creating tenant:', err);
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
          <h2>Add New Tenant</h2>
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
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Phone <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555-123-4567"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assign to Property <span className="required">*</span></label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select a property...</option>
                {properties.map(prop => (
                  <option key={prop._id} value={prop._id}>
                    {prop.name} - {prop.address} ({prop.status})
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <small style={{color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                  No vacant properties available. Please add a property first.
                </small>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Lease Start Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="leaseStart"
                  value={formData.leaseStart}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Lease End Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="leaseEnd"
                  value={formData.leaseEnd}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Monthly Rent ($) <span className="required">*</span></label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Security Deposit ($)</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            <h3 style={{fontSize: '14px', fontWeight: '600', marginTop: '20px', marginBottom: '12px'}}>
              Emergency Contact (Optional)
            </h3>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Jane Doe"
                disabled={loading}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+1 555-987-6543"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  placeholder="Spouse, Parent, etc."
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
                placeholder="Additional notes about the tenant..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading || properties.length === 0}>
                {loading ? '⏳ Adding...' : '✓ Add Tenant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTenantModal;