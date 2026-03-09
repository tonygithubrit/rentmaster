import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const AddPropertyModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'Apartment',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    agentId: ''
  });

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Creating property:', formData);
      
      // Prepare property data
      const propertyData = {
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
        agentId: formData.agentId || undefined
      };

      const response = await api.createProperty(propertyData);
      console.log('📡 Create property response:', response);
      
      if (response.status === 'success') {
        console.log('✅ Property created successfully');
        alert(`Property added successfully! Access Code: ${response.data.accessCode}`);
        if (onSubmit) onSubmit(response.data.property);
        onClose();
      } else {
        setError(response.message || 'Failed to create property');
        alert('Error: ' + (response.message || 'Failed to create property'));
      }
    } catch (err) {
      console.error('❌ Error creating property:', err);
      setError('Failed to connect to server');
      alert('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Property</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Property Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sunset Heights Apt 4B"
                required
              />
            </div>

            <div className="form-group">
              <label>Street Address <span className="required">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main Street"
                required
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
                  placeholder="Los Angeles"
                  required
                />
              </div>

              <div className="form-group">
                <label>State <span className="required">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  maxLength="2"
                  required
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="90001"
                  maxLength="5"
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
                  placeholder="2500"
                  min="0"
                  step="50"
                  required
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
                  placeholder="2"
                  min="0"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="1.5"
                  min="0"
                  max="10"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Square Feet</label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  placeholder="1200"
                  min="0"
                />
              </div>
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
              <small style={{color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                Select which Property Manager handles this property (optional)
              </small>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Property details, amenities, special features..."
                rows="4"
              />
            </div>

            <div className="info-box">
              <strong>📌 Note:</strong> An access code will be automatically generated for this property. You can share it with tenants for registration.
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                ✓ Add Property
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;