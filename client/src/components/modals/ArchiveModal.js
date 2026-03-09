import React, { useState } from 'react';
import './Modal.css';

const ArchiveModal = ({ item, itemType, onClose, onArchive }) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Get appropriate reasons based on item type
  const getReasons = () => {
    if (itemType === 'tenant') {
      return [
        'Lease Ended',
        'Moved Out',
        'Evicted',
        'Lease Terminated Early',
        'Transferred to Another Property',
        'Other'
      ];
    } else if (itemType === 'property') {
      return [
        'Property Sold',
        'No Longer Managing',
        'Under Renovation',
        'Property Demolished',
        'Converted to Personal Use',
        'Other'
      ];
    }
    return ['Other'];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason) {
      alert('Please select a reason for archiving');
      return;
    }

    const archiveData = {
      reason: reason,
      notes: notes,
      archivedAt: new Date().toISOString(),
      archivedBy: localStorage.getItem('userEmail') || 'Unknown'
    };

    if (onArchive) onArchive(archiveData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Archive {itemType === 'tenant' ? 'Tenant' : 'Property'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="info-box warning" style={{ marginBottom: '20px' }}>
            <strong>⚠️ Archiving Records</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
              This will hide the {itemType} from your main list but preserve all records for legal and compliance purposes. You can restore it anytime.
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

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reason for Archiving <span className="required">*</span></label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason...</option>
                {getReasons().map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details about archiving this record..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                📦 Archive
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
