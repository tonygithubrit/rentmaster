import React from 'react';
import './Modal.css';

const RestoreModal = ({ item, itemType, onClose, onRestore }) => {
  const handleRestore = () => {
    if (onRestore) onRestore();
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Restore {itemType === 'tenant' ? 'Tenant' : 'Property'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <strong>↩️ Restoring Records</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
              This will restore the {itemType} to your active list and make it visible again.
            </p>
          </div>

          {/* Item Details */}
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
              {itemType === 'tenant' ? '👤 Tenant' : '🏠 Property'}
            </h4>
            <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {item.name}
            </p>
            {itemType === 'tenant' && item.propertyName && (
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                📍 {item.propertyName}
              </p>
            )}
            {itemType === 'property' && item.address && (
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                📍 {item.address}
              </p>
            )}
          </div>

          {/* Archive Details */}
          {item.archiveReason && (
            <div className="details-list" style={{ marginBottom: '20px' }}>
              <div className="detail-item">
                <span className="detail-label">Archive Reason</span>
                <span className="details-value">{item.archiveReason}</span>
              </div>
              {item.archivedAt && (
                <div className="detail-item">
                  <span className="detail-label">Archived On</span>
                  <span className="details-value">{formatDate(item.archivedAt)}</span>
                </div>
              )}
              {item.archivedBy && (
                <div className="detail-item">
                  <span className="detail-label">Archived By</span>
                  <span className="details-value">{item.archivedBy}</span>
                </div>
              )}
              {item.archiveNotes && (
                <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="detail-label">Notes</span>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {item.archiveNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleRestore} style={{ backgroundColor: '#10b981' }}>
              ↩️ Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreModal;
