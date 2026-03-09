import React, { useState } from 'react';
import './Leadsmanager.css';

// Mock data
const MOCK_LEADS = [
  {
    id: 'l1',
    name: 'Emily White',
    email: 'emily.w@email.com',
    phone: '(555) 123-4567',
    interestedProperty: 'Sunset Heights Apt 4B',
    source: 'Zillow',
    status: 'Hot',
    priority: 'High',
    lastContact: '2 hours ago',
    notes: 'Very interested, wants to schedule viewing ASAP'
  },
  {
    id: 'l2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    interestedProperty: 'Downtown Loft 12',
    source: 'Direct',
    status: 'Warm',
    priority: 'Medium',
    lastContact: '1 day ago',
    notes: 'Looking for 2-bedroom, flexible move-in date'
  },
  {
    id: 'l3',
    name: 'Sarah Rodriguez',
    email: 's.rodriguez@email.com',
    phone: '(555) 345-6789',
    interestedProperty: 'Willow Villa',
    source: 'Facebook',
    status: 'Hot',
    priority: 'High',
    lastContact: '5 hours ago',
    notes: 'Prequalified buyer, ready to sign lease'
  },
  {
    id: 'l4',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    phone: '(555) 456-7890',
    interestedProperty: 'Harbor View Suite',
    source: 'Referral',
    status: 'Cold',
    priority: 'Low',
    lastContact: '1 week ago',
    notes: 'Just browsing, not ready to commit yet'
  }
];

const LeadsManager = () => {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [filter, setFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);

  const getFilteredLeads = () => {
    if (filter === 'All') return leads;
    return leads.filter(lead => lead.status === filter);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Hot':
        return 'status-hot';
      case 'Warm':
        return 'status-warm';
      case 'Cold':
        return 'status-cold';
      default:
        return 'status-default';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  const filteredLeads = getFilteredLeads();

  return (
    <div className="leads-manager">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leads Management</h2>
          <p className="page-subtitle">Track and convert potential clients</p>
        </div>
        <button className="add-btn">+ New Lead</button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['All', 'Hot', 'Warm', 'Cold'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            <span className="tab-count">
              {tab === 'All' 
                ? leads.length 
                : leads.filter(l => l.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="leads-layout">
        {/* Leads List */}
        <div className="leads-list">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
              onClick={() => setSelectedLead(lead)}
            >
              <div className="lead-header">
                <div className="lead-avatar">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="lead-info">
                  <h3 className="lead-name">{lead.name}</h3>
                  <p className="lead-contact">{lead.email}</p>
                </div>
                <div className="lead-badges">
                  <span className={`status-badge ${getStatusClass(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
              <div className="lead-details">
                <div className="detail-item">
                  <span className="detail-icon">🏠</span>
                  <span className="detail-text">{lead.interestedProperty}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{lead.source}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-text">{lead.lastContact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Details Panel */}
        <div className="lead-details-panel">
          {selectedLead ? (
            <>
              <div className="panel-header">
                <div className="panel-avatar-large">
                  {selectedLead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="panel-name">{selectedLead.name}</h3>
                  <div className="panel-badges">
                    <span className={`status-badge ${getStatusClass(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                    <span className={`priority-badge ${getPriorityClass(selectedLead.priority)}`}>
                      {selectedLead.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel-section">
                <h4 className="section-title">Contact Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedLead.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedLead.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Source</span>
                    <span className="info-value">{selectedLead.source}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Contact</span>
                    <span className="info-value">{selectedLead.lastContact}</span>
                  </div>
                </div>
              </div>

              <div className="panel-section">
                <h4 className="section-title">Interested Property</h4>
                <p className="property-name">{selectedLead.interestedProperty}</p>
              </div>

              <div className="panel-section">
                <h4 className="section-title">Notes</h4>
                <p className="notes-text">{selectedLead.notes}</p>
              </div>

              <div className="panel-actions">
                <button className="action-btn primary">📞 Call</button>
                <button className="action-btn primary">✉️ Email</button>
                <button className="action-btn secondary">📅 Schedule</button>
                <button className="action-btn secondary">✏️ Edit</button>
              </div>
            </>
          ) : (
            <div className="panel-empty">
              <div className="empty-icon">🤝</div>
              <p className="empty-text">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsManager;
