import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const ViewTenantFileModal = ({ tenant, onClose }) => {
  if (!tenant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tenant File: {tenant.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Tenant ID</span>
              <span className="details-value">{tenant.id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="details-value">{tenant.name}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="details-value">{tenant.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="details-value">{tenant.phone || 'Not provided'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Property</span>
              <span className="details-value">{tenant.propertyName}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Property Address</span>
              <span className="details-value">{tenant.propertyAddress || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Lease Start</span>
              <span className="details-value">{tenant.leaseStart}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Lease End</span>
              <span className="details-value">{tenant.leaseEnd}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Monthly Rent</span>
              <span className="details-value">${tenant.rent || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="details-value">
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: tenant.status === 'Active' ? '#d1fae5' : '#fee2e2',
                  color: tenant.status === 'Active' ? '#065f46' : '#991b1b'
                }}>
                  {tenant.status}
                </span>
              </span>
            </div>

            {tenant.emergencyContact && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Emergency Contact</span>
                  <span className="details-value">{tenant.emergencyContact}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Emergency Phone</span>
                  <span className="details-value">{tenant.emergencyPhone}</span>
                </div>
              </>
            )}
            {/* Documents Section */}
               <TenantDocuments tenantId={tenant._id || tenant.id} />
          </div>

          <div className="modal-actions" style={{marginTop: '24px'}}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TenantDocuments = ({ tenantId }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getTenantDocuments(tenantId);
        setDocs(res.data.documents || []);
      } catch (err) {
        console.error('Error loading tenant docs:', err);
      } finally {
        setLoading(false);
      }
    };
    if (tenantId) load();
  }, [tenantId]);

  const getDocIcon = (mimeType) => {
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType?.startsWith('image/')) return '🖼️';
    return '📁';
  };

  const handleDownload = async (url, name) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert('❌ Download failed');
  }
};

  return (
    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#334155' }}>
        📁 Tenant Documents {docs.length > 0 && `(${docs.length})`}
      </h4>
      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
      ) : docs.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>No documents uploaded yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {docs.map(doc => (
            <div key={doc._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>{getDocIcon(doc.mimeType)}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{doc.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={doc.url} target="_blank" rel="noreferrer" style={{
                  padding: '5px 12px', background: '#f1f5f9', borderRadius: '6px',
                  fontSize: '12px', textDecoration: 'none', color: '#334155', fontWeight: '500'
                }}>👁️ View</a>
                <button onClick={() => handleDownload(doc.url, doc.name)} style={{
                  padding: '5px 12px', background: '#f1f5f9', border: 'none',
                  borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#334155', fontWeight: '500'
                }}>📥</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ViewTenantFileModal;
