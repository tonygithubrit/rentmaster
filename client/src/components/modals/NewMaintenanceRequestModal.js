import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const NewMaintenanceRequestModal = ({ onClose, onSubmit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    issue: '',
    description: '',
    category: 'Other',
    priority: 'Medium'
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.status === 'success') {
        // Only show occupied or vacant properties
        const availableProperties = response.data.properties.filter(
          p => p.status !== 'Archived'
        );
        setProperties(availableProperties);
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
      console.log('📤 Creating maintenance request:', formData);

      const requestData = {
        propertyId: formData.propertyId,
        issue: formData.issue,
        description: formData.description,
        category: formData.category,
        priority: formData.priority
      };

      const response = await api.createMaintenanceRequest(requestData);
      console.log('📡 Create maintenance response:', response);

      if (response.status === 'success') {
        console.log('✅ Maintenance request created successfully');
        alert('Maintenance request submitted successfully!');
        if (onSubmit) onSubmit(response.data.maintenance);
        onClose();
      } else {
        setError(response.message || 'Failed to create maintenance request');
        alert('Error: ' + (response.message || 'Failed to create request'));
      }
    } catch (err) {
      console.error('❌ Error creating maintenance request:', err);
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
          <h2>New Maintenance Request</h2>
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
                <option value="">Select a property...</option>
                {properties.map(prop => (
                  <option key={prop._id} value={prop._id}>
                    {prop.name} - {prop.address}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <small style={{color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                  No properties available
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC (Heating/Cooling)</option>
                <option value="Appliance">Appliance</option>
                <option value="Structural">Structural</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Issue Summary <span className="required">*</span></label>
              <input
                type="text"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="e.g. Leaking faucet in kitchen"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Detailed Description <span className="required">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the issue..."
                rows="4"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Priority <span className="required">*</span></label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="Low">Low - Can wait</option>
                <option value="Medium">Medium - Normal timeline</option>
                <option value="High">High - Soon as possible</option>
                <option value="Urgent">Urgent - Immediate attention</option>
              </select>
            </div>

            <div className="info-box warning">
              <strong>⚠️ For Emergencies:</strong> If this is an emergency (fire, flood, gas leak, etc.), please call emergency services immediately and then contact property management.
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading || properties.length === 0}>
                {loading ? '⏳ Submitting...' : '✓ Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMaintenanceRequestModal;