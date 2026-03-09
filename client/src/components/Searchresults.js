import React from 'react';
import './Searchresults.css';

const SearchResults = ({ query, results, onClearSearch, onNavigate }) => {
  if (!results) return null;

  const properties = results.properties || [];
  const tenants = results.tenants || [];
  const maintenance = results.maintenance || [];
  const payments = results.payments || [];
  const total = results.total || (properties.length + tenants.length + maintenance.length + payments.length);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0';
    return `$${(amount || 0).toLocaleString()}`;
  };

  if (total === 0) {
    return (
      <div className="search-results">
        <div className="search-header">
          <h2 className="search-title">Search Results for "{query}"</h2>
          <button className="clear-search-btn" onClick={onClearSearch}>✕ Clear Search</button>
        </div>
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try searching for properties, tenants, maintenance requests or payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-header">
        <h2 className="search-title">Search Results for "{query}" ({total})</h2>
        <button className="clear-search-btn" onClick={onClearSearch}>✕ Clear Search</button>
      </div>

      {/* Properties */}
      {properties.length > 0 && (
        <section className="results-section">
          <h3 className="section-title">🏠 Properties ({properties.length})</h3>
          <div className="results-grid">
            {properties.map((p) => (
              <div key={p._id} className="result-card" onClick={() => onNavigate('properties', p)}>
                <div className="result-icon">🏠</div>
                <div className="result-content">
                  <h4 className="result-name">{p.name}</h4>
                  <p className="result-detail">{p.address}</p>
                  <div className="result-meta">
                    <span className={`result-badge status-${p.status?.toLowerCase()}`}>{p.status}</span>
                    <span className="result-price">{formatAmount(p.rent)}/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tenants */}
      {tenants.length > 0 && (
        <section className="results-section">
          <h3 className="section-title">👥 Tenants ({tenants.length})</h3>
          <div className="results-grid">
            {tenants.map((t) => (
              <div key={t._id} className="result-card" onClick={() => onNavigate('tenants', t)}>
                <div className="result-icon">👤</div>
                <div className="result-content">
                  <h4 className="result-name">{t.name}</h4>
                  <p className="result-detail">{t.email}</p>
                  <div className="result-meta">
                    <span className={`result-badge status-${t.status?.toLowerCase()}`}>{t.status}</span>
                    <span className="result-info">📍 {t.propertyName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Maintenance */}
      {maintenance.length > 0 && (
        <section className="results-section">
          <h3 className="section-title">🔧 Maintenance ({maintenance.length})</h3>
          <div className="results-grid">
            {maintenance.map((m) => (
              <div key={m._id} className="result-card" onClick={() => onNavigate('maintenance', m)}>
                <div className="result-icon">🔧</div>
                <div className="result-content">
                  <h4 className="result-name">{m.title || m.description}</h4>
                  <p className="result-detail">{m.propertyName}</p>
                  <div className="result-meta">
                    <span className={`result-badge priority-${m.priority?.toLowerCase()}`}>{m.priority}</span>
                    <span className="result-info">{m.status} • {formatDate(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <section className="results-section">
          <h3 className="section-title">💰 Payments ({payments.length})</h3>
          <div className="results-grid">
            {payments.map((p) => (
              <div key={p._id} className="result-card" onClick={() => onNavigate('payments', p)}>
                <div className="result-icon">💰</div>
                <div className="result-content">
                  <h4 className="result-name">{p.tenantName}</h4>
                  <p className="result-detail">{p.propertyName}</p>
                  <div className="result-meta">
                    <span className={`result-badge status-${p.status?.toLowerCase()}`}>{p.status}</span>
                    <span className="result-price">{formatAmount(p.amount)} • {formatDate(p.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;