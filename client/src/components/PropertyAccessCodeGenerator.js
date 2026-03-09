import React, { useState } from 'react';
import './PropertyAccessCodeGenerator.css';

/**
 * PropertyAccessCodeDisplay
 * 
 * Displays and helps share property access codes with tenants
 * (Note: Codes are now generated automatically by backend when property is created)
 */

const PropertyAccessCodeDisplay = ({ property }) => {
  const [copied, setCopied] = useState(false);

  if (!property || !property.accessCode) {
    return null; // Don't show if no access code
  }

  const copyCode = () => {
    navigator.clipboard.writeText(property.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendCodeViaEmail = () => {
    const subject = encodeURIComponent(`Access Code for ${property.name}`);
    const body = encodeURIComponent(
      `Your property access code is: ${property.accessCode}\n\n` +
      `Use this code to register as a tenant.\n\n` +
      `Property: ${property.name}\n` +
      `Address: ${property.address}, ${property.city}, ${property.state}\n` +
      `Code: ${property.accessCode}\n\n` +
      `Please keep this code secure.`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="access-code-generator">
      <h4 className="generator-title">Tenant Access Code</h4>
      
      <div className="code-display">
        <div className="code-box">
          <span className="code-label">Code:</span>
          <span className="code-value">{property.accessCode}</span>
          <button 
            className={`copy-code-btn ${copied ? 'copied' : ''}`}
            onClick={copyCode}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>

        {property.accessCodeUsed ? (
          <div className="code-status used">
            <span className="status-icon">✓</span>
            <div className="status-info">
              <span className="status-label">Used by:</span>
              <span className="status-value">{property.tenantEmail || 'Tenant'}</span>
            </div>
          </div>
        ) : (
          <div className="code-status available">
            <span className="status-icon">⏳</span>
            <span className="status-label">Available - Share with tenant</span>
          </div>
        )}

        <div className="code-actions">
          <button className="action-btn email-btn" onClick={sendCodeViaEmail}>
            📧 Email Code
          </button>
        </div>

        {property.accessCodeUsed && (
          <p className="used-note">
            This code has been used. Property is now occupied.
          </p>
        )}
      </div>
    </div>
  );
};

export default PropertyAccessCodeDisplay;