import React from 'react';
import PropertyAccessCodeDisplay from '../PropertyAccessCodeGenerator';
import './Modal.css';

const ViewPropertyDetailsModal = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Property Details: {property.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Property Information */}
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Property ID</span>
              <span className="details-value">{property._id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Property Name</span>
              <span className="details-value">{property.name}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Address</span>
              <span className="details-value">
                {property.address}
                {property.city && `, ${property.city}`}
                {property.state && `, ${property.state}`}
                {property.zipCode && ` ${property.zipCode}`}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Property Type</span>
              <span className="details-value">{property.type}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Monthly Rent</span>
              <span className="details-value">${property.rent?.toLocaleString() || 'N/A'}</span>
            </div>

            {property.bedrooms && (
              <div className="detail-item">
                <span className="detail-label">Bedrooms</span>
                <span className="details-value">{property.bedrooms}</span>
              </div>
            )}

            {property.bathrooms && (
              <div className="detail-item">
                <span className="detail-label">Bathrooms</span>
                <span className="details-value">{property.bathrooms}</span>
              </div>
            )}

            {property.sqft && (
              <div className="detail-item">
                <span className="detail-label">Square Feet</span>
                <span className="details-value">{property.sqft.toLocaleString()} sq ft</span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="details-value">
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    property.status === 'Occupied' ? '#d1fae5' :
                    property.status === 'Vacant' ? '#dbeafe' : 
                    property.status === 'Maintenance' ? '#fef3c7' :
                    '#fee2e2',
                  color: 
                    property.status === 'Occupied' ? '#065f46' :
                    property.status === 'Vacant' ? '#1e40af' : 
                    property.status === 'Maintenance' ? '#92400e' :
                    '#991b1b'
                }}>
                  {property.status}
                </span>
              </span>
            </div>

            {property.tenantsCount !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Current Tenants</span>
                <span className="details-value">{property.tenantsCount}</span>
              </div>
            )}

            {property.description && (
              <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="detail-label">Description</span>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  color: 'var(--text-primary, #0f172a)',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  {property.description}
                </p>
              </div>
            )}

            {property.landlordName && (
              <div className="detail-item">
                <span className="detail-label">Landlord</span>
                <span className="details-value">{property.landlordName}</span>
              </div>
            )}

            {property.createdAt && (
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="details-value">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Access Code Section - Only show if property has access code */}
          {property.accessCode && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
              <PropertyAccessCodeDisplay property={property} />
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPropertyDetailsModal;