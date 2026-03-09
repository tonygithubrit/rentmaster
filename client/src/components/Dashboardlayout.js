import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './Dashboardheader';
import LandlordDashboard from './Landlorddashboard';
import TenantDashboard from './Tenantdashboard';
import AgentDashboard from './Agentdashboard';
import PropertyManager from './Propertymanager';
import TenantManager from './Tenantmanager';
import AgentManager from './Agentmanager';
import MaintenanceManager from './Maintenancemanager';
import AITools from './AITools';
import LeadsManager from './Leadsmanager';
import SearchResults from './Searchresults';
import AccountDetails from './Accountdetails';
import Settings from './Settings';
import PaymentTracker from './Paymenttracker';
import PaymentPrompt from './Paymentprompt';
import AddPropertyModal from './modals/AddPropertyModal';
import AddTenantModal from './modals/AddTenantModal';
import LogPaymentModal from './modals/LogPaymentModal';
import VerificationBanner from './Verificationbanner';
import { api } from '../utils/api';
import './Dashboardlayout.css';

const DashboardLayout = ({ userRole }) => {
  // Load activeTab from localStorage on mount
  const [activeTab, setActiveTab] = useState(() => {
  return localStorage.getItem('activeTab') || 'dashboard';
});

const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchQuery('');
  setSearchResults(null);
};
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);
  const navigate = useNavigate();

  // Mock data
  // const mockData = {
  //   properties: [
  //     { id: '1', name: 'Sunset Heights Apt 4B', address: '123 Skyview Lane, Los Angeles, CA', type: 'Apartment', rent: 2450, status: 'Occupied', tenantsCount: 2 },
  //     { id: '2', name: 'Willow Creek Villa', address: '456 Garden St, Austin, TX', type: 'House', rent: 3200, status: 'Vacant', tenantsCount: 0 },
  //     { id: '3', name: 'Downtown Loft 12', address: '88 Commerce Blvd, Chicago, IL', type: 'Apartment', rent: 1850, status: 'Occupied', tenantsCount: 1 },
  //     { id: '4', name: 'Harbor View Suite', address: '12 Marina Way, Seattle, WA', type: 'Apartment', rent: 2900, status: 'Maintenance', tenantsCount: 0 }
  //   ],
  //   tenants: [
  //     { id: 't1', name: 'Alex Johnson', propertyId: '1', propertyName: 'Sunset Heights Apt 4B', leaseStart: '2023-05-01', leaseEnd: '2024-05-01', status: 'Active', email: 'alex.j@example.com' },
  //     { id: 't2', name: 'Sarah Miller', propertyId: '3', propertyName: 'Downtown Loft 12', leaseStart: '2023-08-15', leaseEnd: '2024-08-15', status: 'Active', email: 'smiller@example.com' },
  //     { id: 't3', name: 'Michael Chen', propertyId: '1', propertyName: 'Sunset Heights Apt 4B', leaseStart: '2022-12-01', leaseEnd: '2023-12-01', status: 'Past', email: 'mchen@example.com' }
  //   ],
  //   maintenance: [
  //     { id: 'm1', propertyId: '1', propertyName: 'Sunset Heights Apt 4B', issue: 'Leaking faucet in master bathroom', priority: 'Medium', status: 'Open', date: '2023-11-20' },
  //     { id: 'm2', propertyId: '3', propertyName: 'Downtown Loft 12', issue: 'HVAC unit making strange noise', priority: 'High', status: 'In Progress', date: '2023-11-22' },
  //     { id: 'm3', propertyId: '2', propertyName: 'Willow Creek Villa', issue: 'Broken window in living room', priority: 'Urgent', status: 'Open', date: '2023-11-24' }
  //   ],
  //   leads: [
  //     { id: 'l1', name: 'Emily White', email: 'emily.w@email.com', phone: '(555) 123-4567', interestedProperty: 'Sunset Heights Apt 4B', source: 'Zillow', status: 'Hot', priority: 'High', lastContact: '2 hours ago' },
  //     { id: 'l2', name: 'Michael Chen', email: 'mchen@email.com', phone: '(555) 234-5678', interestedProperty: 'Downtown Loft 12', source: 'Direct', status: 'Warm', priority: 'Medium', lastContact: '1 day ago' },
  //     { id: 'l3', name: 'Sarah Rodriguez', email: 's.rodriguez@email.com', phone: '(555) 345-6789', interestedProperty: 'Willow Villa', source: 'Facebook', status: 'Hot', priority: 'High', lastContact: '5 hours ago' }
  //   ]
  // };

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    setUserName(name || '');
    setUserEmail(email || '');
    const verified = localStorage.getItem('isEmailVerified');
    setIsEmailVerified(verified === 'true');
  }, []);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Quick Action Handlers
const handleQuickAction = (action) => {
  switch(action) {
    case 'add-property':
      setShowAddPropertyModal(true);
      break;
    case 'add-tenant':
      setShowAddTenantModal(true);
      break;
    case 'log-payment':
      setShowLogPaymentModal(true);
      break;
    case 'maintenance':
      setActiveTab('maintenance');
      break;
    default:
      break;
  }
};

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('isEmailVerified');
    localStorage.removeItem('activeTab'); // Clear active tab on logout
    navigate('/');
  };

  // Global Search Function
  const handleSearch = async (query) => {
  setSearchQuery(query);

  if (!query || query.trim().length < 2) {
    setSearchResults(null);
    return;
  }

  try {
    const response = await api.search(query);
    if (response.status === 'success') {
      setSearchResults(response.data);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
};

  const handleClearSearch = () => {
  setSearchQuery('');
  setSearchResults(null);
};

  const handleNavigateFromSearch = (tab, item) => {
    setActiveTab(tab);
    setSearchResults(null);
    setSearchQuery('');
    console.log('Navigating to:', tab, item);
  };

  const renderContent = () => {
    if (searchResults) {
      return (
        <SearchResults
          query={searchQuery}
          results={searchResults}
          onClearSearch={handleClearSearch}
          onNavigate={handleNavigateFromSearch}
        />
      );
    }

    if (activeTab === 'dashboard') {
      if (userRole === 'landlord') {
        return <LandlordDashboard onQuickAction={handleQuickAction} />;
      }
      if (userRole === 'tenant') {
        return <TenantDashboard onNavigate={handleTabChange} />;
      }
      if (userRole === 'agent') {
        return <AgentDashboard onNavigate={handleTabChange} />;
      }
    }

    if (activeTab === 'properties') {
      return <PropertyManager userRole={userRole} />;
    }

   if (activeTab === 'tenants') {
      return <TenantManager userRole={userRole} />;
    }

    if (activeTab === 'agents') {
      return <AgentManager />;
    }

    if (activeTab === 'maintenance') {
      return <MaintenanceManager userRole={userRole} userEmail={userEmail} />;
    }

    if (activeTab === 'payments') {
      return <PaymentTracker userRole={userRole} />;
    }   

    if (activeTab === 'ai-tools') {
      return <AITools />;
    }

    if (activeTab === 'leads') {
      return <LeadsManager />;
    }

    if (activeTab === 'account') {
      return (
        <AccountDetails
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
        />
      );
    }

    if (activeTab === 'settings') {
      return (
        <Settings
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
        />
      );
    }

    return (
      <div className="placeholder-content">
        <h2>Coming Soon</h2>
        <p>The {activeTab} section is under development.</p>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        userRole={userRole}
        onLogout={handleLogout}
      />
      <div className="dashboard-main">
        <DashboardHeader 
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          onSearch={handleSearch}
        />
        <div className="dashboard-content">
          {renderContent()}
        </div>

        {!isEmailVerified && (
            <VerificationBanner onVerified={() => {
              setIsEmailVerified(true);
              localStorage.setItem('isEmailVerified', 'true');
            }} />
          )}
      </div>
      
      <PaymentPrompt
        userRole={userRole}
        onNavigateToAccount={() => setActiveTab('account')}
      />

      {/* Quick Action Modals */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          onSubmit={(property) => {
            console.log('Property added:', property);
            setShowAddPropertyModal(false);
          }}
        />
      )}

      {showAddTenantModal && (
        <AddTenantModal
          onClose={() => setShowAddTenantModal(false)}
          onSubmit={(tenant) => {
            console.log('Tenant added:', tenant);
            setShowAddTenantModal(false);
          }}
        />
      )}

      {showLogPaymentModal && (
        <LogPaymentModal
          onClose={() => setShowLogPaymentModal(false)}
          onSubmit={(payment) => {
            console.log('Payment logged:', payment);
            setShowLogPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;