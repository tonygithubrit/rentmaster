import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Verificationbanner.css';

const VerificationBanner = ({ onVerified }) => {
  const [expanded, setExpanded] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.verifyEmail(code);
      if (res.status === 'success') {
        setSuccess('✅ Email verified!');
        setTimeout(() => onVerified(), 1200);
      } else {
        setError(res.message || 'Invalid code');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.resendOTP();
      if (res.status === 'success') {
        setTimeLeft(180);
        setExpired(false);
        setOtp(['', '', '', '', '', '']);
        setSuccess('New code sent!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to resend');
      }
    } catch {
      setError('Failed to resend.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="vb-wrapper">
      {/* Collapsed pill */}
      {!expanded && (
        <button className="vb-pill" onClick={() => setExpanded(true)}>
          <span className="vb-pill-dot" />
          📧 Verify your email
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="vb-panel">
          <div className="vb-panel-header">
            <span>📧 Verify your email</span>
            <button className="vb-close" onClick={() => setExpanded(false)}>✕</button>
          </div>

          {success ? (
            <div className="vb-success">{success}</div>
          ) : (
            <>
              <p className="vb-desc">Enter the 6-digit code sent to your email.</p>

              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`otp-box ${error ? 'otp-error' : ''}`}
                  />
                ))}
              </div>

              {error && <div className="vb-error">{error}</div>}

              <div className="vb-actions">
                {!expired ? (
                  <span className="vb-timer">⏱ {formatTime(timeLeft)}</span>
                ) : (
                  <button className="vb-resend" onClick={handleResend} disabled={resending}>
                    {resending ? 'Sending...' : '🔄 Resend Code'}
                  </button>
                )}
                <button
                  className="vb-verify"
                  onClick={handleVerify}
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationBanner;