import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Modal.css';

const LeasePDFModal = ({ onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [, setTenant] = useState(null);
  const [uploadForm, setUploadForm] = useState({ documentName: '', documentType: 'Lease Agreement' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDocuments(); }, []);

  
  const fetchDocuments = async () => {
    try {
      const res = await api.getMyDocuments();
      setDocuments(res.data.documents || []);
      setTenant({ name: res.data.tenantName, propertyName: res.data.propertyName });
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF and image files allowed'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Max file size is 10MB'); return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentName', uploadForm.documentName || file.name);
      formData.append('documentType', uploadForm.documentType);

      await api.uploadDocument(formData);
      alert('✅ Document uploaded successfully!');
      setUploadForm({ documentName: '', documentType: 'Lease Agreement' });
      fetchDocuments();
    } catch (err) {
      alert('❌ Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Delete "${docName}"?`)) return;
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d._id !== docId));
    } catch (err) {
      alert('❌ Failed to delete: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocIcon = (mimeType) => {
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType?.startsWith('image/')) return '🖼️';
    return '📁';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 My Documents</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Upload Section */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#334155' }}>📤 Upload New Document</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lease Agreement 2024"
                  value={uploadForm.documentName}
                  onChange={e => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Document Type</label>
                <select
                  value={uploadForm.documentType}
                  onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="Lease Agreement">Lease Agreement</option>
                  <option value="Property Image">Property Image</option>
                  <option value="ID Document">ID Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <label style={{
              display: 'inline-block', padding: '10px 20px',
              background: uploading ? '#94a3b8' : '#2563eb', color: 'white',
              borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '600', fontSize: '14px'
            }}>
              {uploading ? '📤 Uploading...' : '📤 Choose File & Upload'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#94a3b8' }}>PDF, JPG, PNG, WEBP • Max 10MB</p>
          </div>

          {/* Documents List */}
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#334155' }}>
            📂 My Documents {documents.length > 0 && `(${documents.length})`}
          </h3>

          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading documents...</p>
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map(doc => (
                <div key={doc._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{getDocIcon(doc.mimeType)}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{doc.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        {doc.documentType} • {formatSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{
                      padding: '6px 14px', background: '#f1f5f9', border: 'none',
                      borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                      textDecoration: 'none', color: '#334155', fontWeight: '500'
                    }}>👁️ View</a>
                    <button onClick={() => handleDownload(doc.url, doc.name)} style={{
                      padding: '6px 14px', background: '#f1f5f9', border: 'none',
                      borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155', fontWeight: '500'
                    }}>📥 Download</button>
                    <button onClick={() => handleDelete(doc._id, doc.name)} style={{
                      padding: '6px 14px', background: '#fee2e2', border: 'none',
                      borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#991b1b', fontWeight: '500'
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeasePDFModal;