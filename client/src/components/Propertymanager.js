import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AddPropertyModal from './modals/AddPropertyModal';
import ViewPropertyDetailsModal from './modals/ViewPropertyDetailsModal';
import EditPropertyModal from './modals/EditPropertyModal';
import ArchiveModal from './modals/ArchiveModal';
import RestoreModal from './modals/RestoreModal';
import './Propertymanager.css';

// Mock data - will be replaced with API data
// const MOCK_PROPERTIES = [
//   {
//     id: '1',
//     name: 'Sunset Heights Apt 4B',
//     address: '123 Skyview Lane',
//     city: 'Los Angeles',
//     state: 'CA',
//     zipCode: '90001',
//     type: 'Apartment',
//     rent: 2450,
//     bedrooms: 2,
//     bathrooms: 2,
//     sqft: 1200,
//     status: 'Occupied',
//     tenantsCount: 2,
//     accessCode: 'RENT-AB3X-9K2M',
//     accessCodeUsed: true
//   },
//   {
//     id: '2',
//     name: 'Willow Creek Villa',
//     address: '456 Garden St',
//     city: 'Austin',
//     state: 'TX',
//     zipCode: '78701',
//     type: 'House',
//     rent: 3200,
//     bedrooms: 4,
//     bathrooms: 3,
//     sqft: 2400,
//     status: 'Vacant',
//     tenantsCount: 0,
//     accessCode: 'RENT-XY7Z-5P1Q',
//     accessCodeUsed: false
//   },
//   {
//     id: '3',
//     name: 'Downtown Loft 12',
//     address: '88 Commerce Blvd',
//     city: 'Chicago',
//     state: 'IL',
//     zipCode: '60601',
//     type: 'Apartment',
//     rent: 1850,
//     bedrooms: 1,
//     bathrooms: 1,
//     sqft: 800,
//     status: 'Occupied',
//     tenantsCount: 1,
//     accessCode: 'RENT-QW8E-3RT9',
//     accessCodeUsed: true
//   },
//   {
//     id: '4',
//     name: 'Harbor View Suite',
//     address: '12 Marina Way',
//     city: 'Seattle',
//     state: 'WA',
//     zipCode: '98101',
//     type: 'Apartment',
//     rent: 2900,
//     bedrooms: 2,
//     bathrooms: 2.5,
//     sqft: 1500,
//     status: 'Maintenance',
//     tenantsCount: 0,
//     accessCode: 'RENT-AS5D-7FG2',
//     accessCodeUsed: false
//   }
// ];

const PropertyManager = ({ userRole }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  // Filter properties whenever filters change
  useEffect(() => {
    filterProperties();
  }, [properties, showArchived, filterStatus]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching properties from backend...');
      
      const response = await api.getProperties();
      console.log('📦 Properties response:', response);
      
      if (response && response.status === 'success' && response.data) {
        setProperties(response.data.properties || []);
        console.log('✅ Properties loaded:', response.data.properties?.length || 0);
      } else {
        const errorMsg = response?.message || 'Failed to load properties';
        setError(errorMsg);
        console.error('❌ Error:', errorMsg);
      }
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter(p => p.status !== 'Archived');
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    setFilteredProperties(filtered);
  };

  const handleArchive = (archiveData) => {
    const updatedProperties = properties.map(p => 
      p.id === selectedProperty.id 
        ? { 
            ...p, 
            status: 'Archived',
            archiveReason: archiveData.reason,
            archiveNotes: archiveData.notes,
            archivedAt: archiveData.archivedAt,
            archivedBy: archiveData.archivedBy
          }
        : p
    );

    // Update in localStorage
    const allProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedAllProperties = allProperties.map(p => 
      p.id === selectedProperty.id 
        ? updatedProperties.find(up => up.id === p.id)
        : p
    );
    localStorage.setItem('properties', JSON.stringify(updatedAllProperties));
    
    setProperties(updatedProperties);
    setShowArchiveModal(false);
    setSelectedProperty(null);
  };

  const handleRestore = () => {
    const updatedProperties = properties.map(p => 
      p.id === selectedProperty.id 
        ? { 
            ...p, 
            status: 'Vacant',
            restoredAt: new Date().toISOString(),
            restoredBy: localStorage.getItem('userEmail') || 'Unknown',
            lastArchiveReason: p.archiveReason,
            lastArchiveNotes: p.archiveNotes,
            lastArchivedAt: p.archivedAt,
            lastArchivedBy: p.archivedBy,
            archiveReason: undefined,
            archiveNotes: undefined,
            archivedAt: undefined,
            archivedBy: undefined
          }
        : p
    );

    // Update in localStorage
    const allProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedAllProperties = allProperties.map(p => 
      p.id === selectedProperty.id 
        ? updatedProperties.find(up => up.id === p.id)
        : p
    );
    localStorage.setItem('properties', JSON.stringify(updatedAllProperties));

    setProperties(updatedProperties);
    setShowRestoreModal(false);
    setSelectedProperty(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Occupied': 'status-occupied',
      'Vacant': 'status-vacant',
      'Maintenance': 'status-maintenance',
      'Archived': 'status-archived'
    };
    return statusMap[status] || 'status-default';
  };

  const archivedCount = properties.filter(p => p.status === 'Archived').length;

  return (
    <div className="property-manager">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Properties</h2>
          <p className="page-subtitle">Manage your rental properties</p>
        </div>
        {userRole !== 'agent' && (
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            + Add Property
          </button>
        )}
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
            <option value="Occupied">Occupied</option>
            <option value="Vacant">Vacant</option>
            <option value="Maintenance">Maintenance</option>
            {showArchived && <option value="Archived">Archived</option>}
          </select>
        </div>

        <div className="filter-group">
          <label className="archive-toggle">
            <input 
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            <span>Show Archived ({archivedCount})</span>
          </label>
        </div>
      </div>

      {/* Properties List */}
      <div className="properties-grid">
        {filteredProperties.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No Properties Found</h3>
            <p>
              {showArchived 
                ? "No archived properties yet" 
                : "Start by adding your first property"}
            </p>
            {!showArchived && userRole !== 'agent' && (
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                + Add Property
              </button>
            )}
          </div>
        ) : (
          filteredProperties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-card-header">
                <div className="property-icon">🏠</div>
                <div className="property-info">
                  <h3 className="property-name">{property.name}</h3>
                  <p className="property-address">{property.address}</p>
                  {property.city && property.state && (
                    <p className="property-location">
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                  )}
                </div>
                <span className={`status-badge ${getStatusBadgeClass(property.status)}`}>
                  {property.status}
                </span>
              </div>

              <div className="property-card-body">
                <div className="property-detail">
                  <span className="detail-label">Type:</span>
                  <span className="details-value">{property.type}</span>
                </div>
                <div className="property-detail">
                  <span className="detail-label">Monthly Rent:</span>
                  <span className="details-value">${property.rent?.toLocaleString() || 'N/A'}</span>
                </div>
                {property.bedrooms && (
                  <div className="property-detail">
                    <span className="detail-label">Beds/Baths:</span>
                    <span className="details-value">
                      {property.bedrooms} bd / {property.bathrooms} ba
                    </span>
                  </div>
                )}
                {property.sqft && (
                  <div className="property-detail">
                    <span className="detail-label">Size:</span>
                    <span className="details-value">{property.sqft.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>

              <div className="property-card-actions">
                {property.status !== 'Archived' ? (
                  <>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowDetailsModal(true);
                      }}
                    >
                      👁️ Details
                    </button>
                    {userRole !== 'agent' && (
                      <>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowEditModal(true);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="action-btn archive-btn"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowArchiveModal(true);
                          }}
                        >
                          📦 Archive
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  userRole !== 'agent' && (
                    <button 
                      className="action-btn restore-btn"
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowRestoreModal(true);
                      }}
                    >
                      ↩️ Restore
                    </button>
                  )
                )}
              </div>

              {/* Show archive info if archived */}
              {property.status === 'Archived' && property.archiveReason && (
                <div className="archive-info">
                  <small>
                    📦 Archived: {property.archiveReason}
                    {property.archivedAt && ` on ${new Date(property.archivedAt).toLocaleDateString()}`}
                  </small>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(newProperty) => {
            loadProperties();
            setShowAddModal(false);
          }}
        />
      )}

      {showDetailsModal && selectedProperty && (
        <ViewPropertyDetailsModal
          property={selectedProperty}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {showEditModal && selectedProperty && (
        <EditPropertyModal
          property={selectedProperty}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
          onSubmit={(updatedProperty) => {
            loadProperties();
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {showArchiveModal && selectedProperty && (
        <ArchiveModal
          item={selectedProperty}
          itemType="property"
          onClose={() => {
            setShowArchiveModal(false);
            setSelectedProperty(null);
          }}
          onArchive={handleArchive}
        />
      )}

      {showRestoreModal && selectedProperty && (
        <RestoreModal
          item={selectedProperty}
          itemType="property"
          onClose={() => {
            setShowRestoreModal(false);
            setSelectedProperty(null);
          }}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
};

export default PropertyManager;