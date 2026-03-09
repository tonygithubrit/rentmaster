import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const EditPropertyModal = ({ property, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: property.name || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zipCode: property.zipCode || '',
    type: property.type || 'Apartment',
    rent: property.rent || '',
    bedrooms: property.bedrooms || '',
    bathrooms: property.bathrooms || '',
    sqft: property.sqft || '',
    description: property.description || '',
    status: property.status || 'Vacant',
    agentId: property.agentId?._id || property.agentId || '' // Handle both populated and ID
  });

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      // Load ALL registered agents (not just landlord's contacts)
      const response = await api.getRegisteredAgents();
      if (response.status === 'success') {
        setAgents(response.data.agents || []);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
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
      console.log('📤 Updating property:', property._id);
      
      // Prepare update data
      const updateData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        type: formData.type,
        rent: parseFloat(formData.rent),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
        sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
        description: formData.description,
        status: formData.status,
        agentId: formData.agentId || undefined
      };

      const response = await api.updateProperty(property._id, updateData);
      console.log('📡 Update property response:', response);
      
      if (response.status === 'success') {
        console.log('✅ Property updated successfully');
        alert('Property updated successfully!');
        if (onSubmit) onSubmit(response.data.property);
        onClose();
      } else {
        setError(response.message || 'Failed to update property');
        alert('Error: ' + (response.message || 'Failed to update property'));
      }
    } catch (err) {
      console.error('❌ Error updating property:', err);
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
          <h2>Edit Property: {property.name}</h2>
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
              <label>Property Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Street Address <span className="required">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>City <span className="required">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>State <span className="required">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  maxLength="2"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  maxLength="5"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Property Type <span className="required">*</span></label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Shop">Shop</option>
                  <option value="Flat">Flat</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Rent ($) <span className="required">*</span></label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.5"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Square Feet</label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Property Manager</label>
                <select
                  name="agentId"
                  value={formData.agentId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">No Property Manager Assigned</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} - {agent.email} ({agent.commissionRate || 5}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyModal;