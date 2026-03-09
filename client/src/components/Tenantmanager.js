import React, { useState, useEffect } from 'react';
import AddTenantModal from './modals/AddTenantModal';
import EditTenantModal from './modals/EditTenantModal';
import ViewTenantFileModal from './modals/ViewTenantFileModal';
import { api } from '../utils/api';
import './Tenantmanager.css';

const TenantManager = ({ userRole }) => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewFileModal, setShowViewFileModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, showArchived, filterStatus]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching tenants from backend...');
      
     const response = userRole === 'agent' 
      ? await api.getMyTenants()
      : await api.getTenants();
      console.log('📦 Tenants response:', response);
      
      if (response.status === 'success') {
        setTenants(response.data.tenants);
        console.log('✅ Tenants loaded:', response.data.tenants.length);
      } else {
        setError(response.message || 'Failed to load tenants');
        console.error('❌ Error:', response.message);
      }
    } catch (err) {
      console.error('❌ Error loading tenants:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // Note: Backend doesn't have "Archived" status for tenants
    // Using "Past" instead
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    setFilteredTenants(filtered);
  };

  const handleDelete = async (tenant) => {
    if (!window.confirm(`Are you sure you want to remove ${tenant.name} as a tenant?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting tenant:', tenant._id);
      const response = await api.deleteTenant(tenant._id);
      
      if (response.status === 'success') {
        console.log('✅ Tenant deleted successfully');
        await loadTenants();
        alert('Tenant removed successfully');
      } else {
        alert('Failed to delete tenant: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error deleting tenant:', err);
      alert('Failed to delete tenant');
    }
  };

  const handleMarkAsPast = async (tenant) => {
    if (!window.confirm(`Mark ${tenant.name} as a past tenant? This will make the property vacant.`)) {
      return;
    }

    try {
      console.log('📝 Marking tenant as past:', tenant._id);
      const response = await api.markTenantAsPast(tenant._id);
      
      if (response.status === 'success') {
        console.log('✅ Tenant marked as past');
        await loadTenants();
        alert('Tenant marked as past tenant');
      } else {
        alert('Failed to update tenant: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error updating tenant:', err);
      alert('Failed to update tenant');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Active': 'status-active',
      'Past': 'status-past',
      'Pending': 'status-pending'
    };
    return statusMap[status] || 'status-default';
  };

  const pastCount = tenants.filter(t => t.status === 'Past').length;

  // Loading state
  if (loading) {
    return (
      <div className="tenant-manager">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading tenants...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="tenant-manager">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Tenants</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadTenants}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-manager">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Tenants</h2>
          <p className="page-subtitle">Manage your tenants and leases</p>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add Tenant
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Past">Past ({pastCount})</option>
          </select>
        </div>
      </div>

      <div className="tenants-grid">
        {filteredTenants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Tenants Found</h3>
            <p>Start by adding your first tenant</p>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              + Add Tenant
            </button>
          </div>
        ) : (
          filteredTenants.map(tenant => (
            <div key={tenant._id} className="tenant-card">
              <div className="tenant-card-header">
                <div className="tenant-avatar">{tenant.name.charAt(0)}</div>
                <div className="tenant-info">
                  <h3 className="tenant-name">{tenant.name}</h3>
                  <p className="tenant-property">
                    {tenant.propertyId?.name || tenant.propertyName}
                  </p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(tenant.status)}`}>
                  {tenant.status}
                </span>
              </div>

              <div className="tenant-card-body">
                <div className="tenant-detail">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{tenant.email}</span>
                </div>
                <div className="tenant-detail">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{tenant.phone}</span>
                </div>
                <div className="tenant-detail">
                  <span className="detail-label">Monthly Rent:</span>
                  <span className="detail-value">${tenant.monthlyRent?.toLocaleString()}</span>
                </div>
                <div className="tenant-detail">
                  <span className="detail-label">Lease:</span>
                  <span className="detail-value">
                    {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="tenant-card-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setShowViewFileModal(true);
                  }}
                >
                  📄 Details
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setShowEditModal(true);
                  }}
                >
                  ✏️ Edit
                </button>
                {tenant.status === 'Active' && (
                  <button 
                    className="action-btn"
                    onClick={() => handleMarkAsPast(tenant)}
                  >
                    ⏭️ Past
                  </button>
                )}
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(tenant)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddTenantModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async () => {
            await loadTenants();
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
          onSubmit={async () => {
            await loadTenants();
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showViewFileModal && selectedTenant && (
        <ViewTenantFileModal
          tenant={selectedTenant}
          onClose={() => {
            setShowViewFileModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </div>
  );
};

export default TenantManager;