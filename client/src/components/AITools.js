import React, { useState } from 'react';
import { api } from '../utils/api';
import './AITools.css';

const AITools = () => {
  // Lease states
  const [leaseDraft, setLeaseDraft] = useState('');
  const [leaseLoading, setLeaseLoading] = useState(false);
  const [leaseError, setLeaseError] = useState('');
  const [leaseCopied, setLeaseCopied] = useState(false);
  const [leaseForm, setLeaseForm] = useState({ property: '', tenant: '', rent: '', terms: '' });

  // Market states
  const [marketInsights, setMarketInsights] = useState('');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [marketCopied, setMarketCopied] = useState(false);
  const [marketAddress, setMarketAddress] = useState('');

  // Custom ask states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState('');
  const [askCopied, setAskCopied] = useState(false);

  // ─── Lease Generator ────────────────────────────────────────────────────────
  const handleLeaseGen = async () => {
    setLeaseError('');
    setLeaseDraft('');
    setLeaseCopied(false);
    if (!leaseForm.tenant.trim()) { setLeaseError('Please enter a tenant name'); return; }
    if (!leaseForm.property.trim()) { setLeaseError('Please enter a property name'); return; }
    if (!leaseForm.rent) { setLeaseError('Please enter monthly rent'); return; }
    setLeaseLoading(true);
    try {
      const response = await api.aiGenerateLease(leaseForm);
      if (response.status === 'success') {
        setLeaseDraft(response.data.text);
      } else {
        setLeaseError(response.message || 'Failed to generate lease');
      }
    } catch {
      setLeaseError('Failed to connect to AI. Please try again.');
    } finally {
      setLeaseLoading(false);
    }
  };

  // ─── Market Insights ─────────────────────────────────────────────────────────
  const handleMarketGen = async () => {
    setMarketError('');
    setMarketInsights('');
    setMarketCopied(false);
    if (!marketAddress.trim()) { setMarketError('Please enter a location'); return; }
    setMarketLoading(true);
    try {
      const response = await api.aiGetMarketInsights(marketAddress);
      if (response.status === 'success') {
        setMarketInsights(response.data.text);
      } else {
        setMarketError(response.message || 'Failed to fetch insights');
      }
    } catch {
      setMarketError('Failed to connect to AI. Please try again.');
    } finally {
      setMarketLoading(false);
    }
  };

  // ─── Ask AI ──────────────────────────────────────────────────────────────────
  const handleAskAI = async () => {
    setAskError('');
    setAnswer('');
    setAskCopied(false);
    if (!question.trim()) { setAskError('Please enter a question'); return; }
    setAskLoading(true);
    try {
      const response = await api.aiAsk(question);
      if (response.status === 'success') {
        setAnswer(response.data.text);
      } else {
        setAskError(response.message || 'Failed to get response');
      }
    } catch {
      setAskError('Failed to connect to AI. Please try again.');
    } finally {
      setAskLoading(false);
    }
  };

  const copyText = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-tools">
      <div className="ai-tools-header">
        <h2 className="page-title">✨ AI Insights & Tools</h2>
        <p className="page-subtitle">Powered by Gemini AI — your smart property management assistant</p>
      </div>

      <div className="tools-grid">

        {/* ── Lease Draft Assistant ── */}
        <div className="tool-card">
          <div className="tool-header lease-header">
            <h3 className="tool-title">✨ Lease Draft Assistant</h3>
            <p className="tool-description">Generate professional lease agreements in seconds.</p>
          </div>
          <div className="tool-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Heights Apt 4B"
                  className={`form-input ${leaseError && !leaseForm.property ? 'input-error' : ''}`}
                  value={leaseForm.property}
                  onChange={(e) => { setLeaseForm({ ...leaseForm, property: e.target.value }); setLeaseError(''); }}
                  disabled={leaseLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tenant Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`form-input ${leaseError && !leaseForm.tenant ? 'input-error' : ''}`}
                  value={leaseForm.tenant}
                  onChange={(e) => { setLeaseForm({ ...leaseForm, tenant: e.target.value }); setLeaseError(''); }}
                  disabled={leaseLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Rent ($)</label>
              <input
                type="number"
                placeholder="e.g. 2450"
                className={`form-input ${leaseError && !leaseForm.rent ? 'input-error' : ''}`}
                value={leaseForm.rent}
                onChange={(e) => { setLeaseForm({ ...leaseForm, rent: e.target.value }); setLeaseError(''); }}
                disabled={leaseLoading}
              />
            </div>
            {leaseError && <div className="error-message"><span className="error-icon">⚠️</span><span>{leaseError}</span></div>}
            <div className="form-group">
              <label className="form-label">Additional Terms</label>
              <textarea
                rows={3}
                placeholder="e.g. No pets allowed, parking included..."
                className="form-textarea"
                value={leaseForm.terms}
                onChange={(e) => setLeaseForm({ ...leaseForm, terms: e.target.value })}
                disabled={leaseLoading}
              />
            </div>
            <button onClick={handleLeaseGen} disabled={leaseLoading} className={`generate-btn ${leaseLoading ? 'loading' : ''}`}>
              {leaseLoading ? <><span className="spinner"></span>Generating...</> : 'Generate Lease Agreement'}
            </button>
            {leaseDraft && (
              <div className="result-box">
                <div className="result-header">
                  <h4 className="result-title">Generated Draft</h4>
                  <button className="copy-btn" onClick={() => copyText(leaseDraft, setLeaseCopied)}>
                    {leaseCopied ? '✓ Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="result-content">{leaseDraft}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Market Pulse ── */}
        <div className="tool-card">
          <div className="tool-header market-header">
            <h3 className="tool-title">🌍 Market Pulse</h3>
            <p className="tool-description">Real-time local rental market intelligence.</p>
          </div>
          <div className="tool-body">
            <div className="form-group">
              <label className="form-label">Location Area</label>
              <input
                type="text"
                placeholder="e.g. Austin, TX"
                className={`form-input ${marketError ? 'input-error' : ''}`}
                value={marketAddress}
                onChange={(e) => { setMarketAddress(e.target.value); setMarketError(''); }}
                disabled={marketLoading}
              />
            </div>
            {marketError && <div className="error-message"><span className="error-icon">⚠️</span><span>{marketError}</span></div>}
            <button onClick={handleMarketGen} disabled={marketLoading} className={`generate-btn market-btn ${marketLoading ? 'loading' : ''}`}>
              {marketLoading ? <><span className="spinner"></span>Analyzing...</> : 'Fetch Market Insights'}
            </button>
            {marketInsights && (
              <div className="result-box market-result">
                <div className="result-header">
                  <h4 className="result-title market-title">🔍 Analysis Result</h4>
                  <button className="copy-btn" onClick={() => copyText(marketInsights, setMarketCopied)}>
                    {marketCopied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="result-content market-content">{marketInsights}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Need Something Else? ── */}
        <div className="tool-card ask-card">
          <div className="tool-header ask-header">
            <h3 className="tool-title">🤖 Need Something Else?</h3>
            <p className="tool-description">Ask RentMaster AI anything about property management.</p>
          </div>
          <div className="tool-body">
            <div className="form-group">
              <label className="form-label">Your Question</label>
              <textarea
                rows={4}
                placeholder="e.g. What are my legal obligations when a tenant breaks a lease? How do I handle late rent payments? What's a fair security deposit amount?"
                className={`form-textarea ${askError ? 'input-error' : ''}`}
                value={question}
                onChange={(e) => { setQuestion(e.target.value); setAskError(''); }}
                disabled={askLoading}
              />
            </div>
            {askError && <div className="error-message"><span className="error-icon">⚠️</span><span>{askError}</span></div>}
            <button onClick={handleAskAI} disabled={askLoading} className={`generate-btn ask-btn ${askLoading ? 'loading' : ''}`}>
              {askLoading ? <><span className="spinner"></span>Thinking...</> : '🤖 Ask AI'}
            </button>
            {answer && (
              <div className="result-box ask-result">
                <div className="result-header">
                  <h4 className="result-title ask-title">💡 AI Response</h4>
                  <button className="copy-btn" onClick={() => copyText(answer, setAskCopied)}>
                    {askCopied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="result-content ask-content">{answer}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AITools;