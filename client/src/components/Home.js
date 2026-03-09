import React from 'react';
import RoleCard from './Rolecard';
import { FaBuilding, FaKey, FaHandshake } from 'react-icons/fa';
import './Homepage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1><span className="highlight">Rent</span>Master Pro</h1>
      <p className="subtitle">The intelligent ecosystem for rental management</p>

      <div className="role-cards-container">
        <RoleCard
          icon={<FaBuilding />}
          title="Landlord / Manager"
          description="Full control over properties, tenants, and finances."
          role="landlord"
        />
        <RoleCard
          icon={<FaKey />}
          title="Tenant / Resident"
          description="View your lease, pay rent, and request maintenance."
          role="tenant"
        />
        <RoleCard
          icon={<FaHandshake />}
          title="Property Manager"
          description="Manage properties and tenants."
          role="agent"
        />
      </div>

      <p className="footer">Enterprise features powered by <strong>Gemini AI</strong></p>
    </div>
  );
};

export default HomePage;
