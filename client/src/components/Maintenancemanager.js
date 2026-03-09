import React, { useState, useEffect } from 'react';
import NewMaintenanceRequestModal from './modals/NewMaintenanceRequestModal';
import { api } from '../utils/api';
import './Maintenancemanager.css';

const MaintenanceManager = ({ userRole }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  useEffect(() => {
    loadMaintenanceRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filterStatus, filterPriority]);

  const loadMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching maintenance requests from backend...');
      
      const response = await api.getMaintenanceRequests();
      console.log('📦 Maintenance response:', response);
      
      if (response && response.status === 'success' && response.data) {
        setRequests(response.data.maintenanceRequests || []);
        console.log('✅ Maintenance requests loaded:', response.data.maintenanceRequests?.length || 0);
      } else {
        const errorMsg = response?.message || 'Failed to load maintenance requests';
        setError(errorMsg);
        console.error('❌ Error:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Error loading maintenance requests:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(r => r.priority === filterPriority);
    }

    setFilteredRequests(filtered);
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      console.log('📝 Updating status:', requestId, newStatus);
      const response = await api.updateMaintenanceStatus(requestId, newStatus);
      
      if (response.status === 'success') {
        console.log('✅ Status updated successfully');
        await loadMaintenanceRequests();
      } else {
        alert('Failed to update status: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (request) => {
    if (!window.confirm(`Are you sure you want to delete this maintenance request?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting maintenance request:', request._id);
      const response = await api.deleteMaintenanceRequest(request._id);
      
      if (response.status === 'success') {
        console.log('✅ Request deleted successfully');
        await loadMaintenanceRequests();
        alert('Maintenance request deleted successfully');
      } else {
        alert('Failed to delete request: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Error deleting request:', err);
      alert('Failed to delete request');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-medium';
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Open': 'status-open',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-open';
  };

  // Loading state
  if (loading) {
    return (
      <div className="maintenance-manager">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="maintenance-manager">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Maintenance Requests</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadMaintenanceRequests}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-manager">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Maintenance Requests</h2>
          <p className="page-subtitle">Track and manage property maintenance</p>
        </div>
        <button className="add-btn" onClick={() => setShowNewRequestModal(true)}>
          + New Request
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority:</label>
          <select 
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="stats-summary">
          <span className="stat-item">
            <strong>{requests.filter(r => r.status === 'Open').length}</strong> Open
          </span>
          <span className="stat-item">
            <strong>{requests.filter(r => r.status === 'In Progress').length}</strong> In Progress
          </span>
          <span className="stat-item">
            <strong>{requests.filter(r => r.priority === 'Urgent').length}</strong> Urgent
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h3>No Maintenance Requests Found</h3>
            <p>
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? "No requests match your filters"
                : "No maintenance requests yet"}
            </p>
            <button className="add-btn" onClick={() => setShowNewRequestModal(true)}>
              + Create First Request
            </button>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request._id} className="request-card">
              <div className="request-card-header">
                <div className="request-icon">🔧</div>
                <div className="request-info">
                  <h3 className="request-issue">{request.issue}</h3>
                  <p className="request-property">
                    {request.propertyId?.name || request.propertyName}
                  </p>
                </div>
                <div className="badges">
                  <span className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="request-card-body">
                {request.description && (
                  <div className="request-detail">
                    <span className="detail-label">Description:</span>
                    <p className="detail-value">{request.description}</p>
                  </div>
                )}

                <div className="request-detail">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{request.category}</span>
                </div>

                <div className="request-detail">
                  <span className="detail-label">Reported by:</span>
                  <span className="detail-value">
                    {request.reportedBy?.name || request.reporterName} ({request.reporterRole})
                  </span>
                </div>

                <div className="request-detail">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {request.estimatedCost && (
                  <div className="request-detail">
                    <span className="detail-label">Est. Cost:</span>
                    <span className="detail-value">${request.estimatedCost.toLocaleString()}</span>
                  </div>
                )}

                {request.actualCost && (
                  <div className="request-detail">
                    <span className="detail-label">Actual Cost:</span>
                    <span className="detail-value">${request.actualCost.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="request-card-actions">
                {userRole === 'landlord' && request.status !== 'Completed' && request.status !== 'Cancelled' && (
                  <>
                    {request.status === 'Open' && (
                      <button 
                        className="action-btn progress-btn"
                        onClick={() => handleStatusChange(request._id, 'In Progress')}
                      >
                        ▶️ Start Work
                      </button>
                    )}
                    {request.status === 'In Progress' && (
                      <button 
                        className="action-btn complete-btn"
                        onClick={() => handleStatusChange(request._id, 'Completed')}
                      >
                        ✅ Complete
                      </button>
                    )}
                    <button 
                      className="action-btn cancel-btn"
                      onClick={() => handleStatusChange(request._id, 'Cancelled')}
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}

                {userRole === 'landlord' && (
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(request)}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Show completion date if completed */}
              {request.status === 'Completed' && request.completedDate && (
                <div className="completion-info">
                  <small>
                    ✅ Completed on {new Date(request.completedDate).toLocaleDateString()}
                  </small>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <NewMaintenanceRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={async () => {
            await loadMaintenanceRequests();
            setShowNewRequestModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceManager;