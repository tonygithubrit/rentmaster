import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Agentmanager.css';

const AgentManager = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    commissionRate: '5',
    paymentNote: ''
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching agents from backend...');
      
      const response = await api.getAgents();
      console.log('📦 Agents response:', response);
      
      if (response && response.status === 'success' && response.data) {
        setAgents(response.data.agents || []);
        console.log('✅ Agents loaded:', response.data.agents?.length || 0);
      } else {
        const errorMsg = response?.message || 'Failed to load Property Managers';
        setError(errorMsg);
        console.error('❌ Error:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Error loading agents:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAgent) {
        // Update existing agent
        console.log('📤 Updating agent:', editingAgent._id);
        const response = await api.updateAgent(editingAgent._id, formData);
        
        if (response.status === 'success') {
          console.log('✅ Agent updated successfully');
          alert('Property Manager updated successfully!');
          await loadAgents();
          resetForm();
        } else {
          alert('Error: ' + (response.message || 'Failed to update Property Manager'));
        }
      } else {
        // Add new agent
        console.log('📤 Creating agent:', formData);
        const response = await api.createAgent(formData);
        
        if (response.status === 'success') {
          console.log('✅ Agent created successfully');
          alert('Property Manager added successfully!');
          await loadAgents();
          resetForm();
        } else {
          alert('Error: ' + (response.message || 'Failed to create Property Manager'));
        }
      }
    } catch (err) {
      console.error('❌ Error saving agent:', err);
      alert('Failed to save Property Manager');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      bankName: agent.bankName,
      accountName: agent.accountName,
      accountNumber: agent.accountNumber,
      routingNumber: agent.routingNumber,
      commissionRate: agent.commissionRate || '5',
      paymentNote: agent.paymentNote || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (agent) => {
    if (!window.confirm(`Are you sure you want to remove ${agent.name}? Properties assigned to this property manager will need to be reassigned.`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting agent:', agent._id);
      const response = await api.deleteAgent(agent._id);
      
      if (response.status === 'success') {
        console.log('✅ Agent deleted successfully');
        await loadAgents();
        alert('Property Manager removed successfully!');
      } else {
        alert('Failed to delete Property Manager: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error deleting agent:', err);
      alert('Failed to delete Property Manager');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      commissionRate: '5',
      paymentNote: ''
    });
    setEditingAgent(null);
    setShowAddModal(false);
    loadAgents();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Loading state
  if (loading && !showAddModal) {
    return (
      <div className="agent-manager">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading property managers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && agents.length === 0) {
    return (
      <div className="agent-manager">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Property Managers</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAgents}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-manager">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Property Manager Management</h2>
          <p className="page-subtitle">Manage your property managers</p>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add Property Manager
        </button>
      </div>

      <div className="agents-grid">
        {agents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤝</div>
            <h3>No Property Managers Yet</h3>
            <p>Start by adding your first property manager</p>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              + Add First Property Manager
            </button>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent._id} className="agent-card">
              <div className="agent-card-header">
                <div className="agent-avatar">👤</div>
                <div className="agent-info">
                  <h3 className="agent-name">{agent.name}</h3>
                  <p className="agent-email">{agent.email}</p>
                </div>
                {agent.userId && (
                  <span className="registered-badge" title="Has user account">
                    ✓ Registered
                  </span>
                )}
              </div>

              <div className="agent-card-body">
                <div className="agent-detail">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{agent.phone}</span>
                </div>

                <div className="agent-detail">
                  <span className="detail-label">Commission Rate:</span>
                  <span className="detail-value">{agent.commissionRate}%</span>
                </div>

                <div className="agent-detail">
                  <span className="detail-label">Bank:</span>
                  <span className="detail-value">{agent.bankName}</span>
                </div>

                <div className="agent-detail">
                  <span className="detail-label">Account:</span>
                  <span className="detail-value">{agent.accountNumber}</span>
                </div>

                {agent.paymentNote && (
                  <div className="agent-detail full-width">
                    <span className="detail-label">Payment Note:</span>
                    <span className="detail-value">{agent.paymentNote}</span>
                  </div>
                )}
              </div>

              <div className="agent-card-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(agent)}>
                  ✏️ Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(agent)}>
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Agent Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAgent ? 'Edit Property Manager' : 'Add New Property Manager'}</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>

            <div className="modal-body">
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
                      placeholder="john@agency.com"
                      required
                      disabled={editingAgent} // Can't change email
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
                    />
                  </div>
                </div>

                <h3 className="section-title">Bank Details</h3>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Chase Bank"
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="form-group">
                    <label>Routing Number</label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Note</label>
                  <textarea
                    name="paymentNote"
                    value={formData.paymentNote}
                    onChange={handleChange}
                    placeholder="e.g., Please include property address in payment description"
                    rows="3"
                  />
                </div>

                <div className="info-box">
                  <strong>ℹ️ Note:</strong> The property manager can later register with this email to access the system.
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingAgent ? '✓ Update Property Manager' : '✓ Add Property Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManager;