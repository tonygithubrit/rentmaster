import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './Paymentprompt.css';

const PaymentPrompt = ({ userRole, onNavigateToAccount, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkBankDetails();
  }, [userRole]);

  const checkBankDetails = async () => {
    try {
      const promptDismissed = localStorage.getItem('paymentPromptDismissed');
      
      // Only show for landlords and agents
      if (userRole !== 'landlord' && userRole !== 'agent') {
        setShow(false);
        return;
      }

      // Check if user has bank details in database
      const response = await api.getCurrentUser();
      
      if (response.status === 'success') {
        const user = response.data.user;
        const hasBankDetails = user.bankDetails && user.bankDetails.bankName;
        
        // Show prompt if no bank details and not dismissed
        const shouldShow = !hasBankDetails && !promptDismissed;
        setShow(shouldShow);
      }
    } catch (err) {
      console.error('Error checking bank details:', err);
    }
  };

  const handleSetup = () => {
    onNavigateToAccount();
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('paymentPromptDismissed', 'true');
    setShow(false);
    if (onDismiss) onDismiss();
  };

  if (!show) return null;

  return (
    <div className="payment-prompt-overlay">
      <div className="payment-prompt-modal">
        <button className="prompt-close-btn" onClick={handleDismiss}>✕</button>
        
        <div className="prompt-icon">💳</div>
        
        <h2 className="prompt-title">Complete Your Payment Setup</h2>
        <p className="prompt-message">
          {userRole === 'landlord' 
            ? 'Add your bank details so tenants can send you rent payments securely.'
            : 'Add your bank details to receive commission payments from landlords.'}
        </p>

        <div className="prompt-features">
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span className="feature-text">Secure bank account linking</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span className="feature-text">Easy for {userRole === 'landlord' ? 'tenants' : 'clients'} to pay</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span className="feature-text">Track all payments in one place</span>
          </div>
        </div>

        <div className="prompt-actions">
          <button className="setup-btn" onClick={handleSetup}>
            Complete Setup Now
          </button>
          <button className="later-btn" onClick={handleDismiss}>
            I'll Do This Later
          </button>
        </div>

        <p className="prompt-note">
          You can always set this up later in Account Settings
        </p>
      </div>
    </div>
  );
};

export default PaymentPrompt;