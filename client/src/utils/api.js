const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get token
const getToken = () => localStorage.getItem('token');

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  // ============ AUTHENTICATION ============
  register: async (userData) => {
    try {
      console.log('📤 Sending registration data:', userData);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📡 Registration response:', data);
      
      if (data.status === 'success') {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('userEmail', data.data.user.email);
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('userPhone', data.data.user.phone || '');
        localStorage.setItem('authTimestamp', new Date().toISOString());
        
        console.log('✅ Data stored in localStorage:', {
          token: localStorage.getItem('token'),
          role: localStorage.getItem('userRole'),
          email: localStorage.getItem('userEmail'),
          name: localStorage.getItem('userName')
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        status: 'error',
        message: 'Failed to connect to server'
      };
    }
  },

  login: async (email, password) => {
    try {
      console.log('📤 Attempting login for:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('📡 Login response:', data);
      
      if (data.status === 'success') {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('userEmail', data.data.user.email);
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('userPhone', data.data.user.phone || '');
        localStorage.setItem('authTimestamp', new Date().toISOString());
        
        console.log('✅ Data stored in localStorage:', {
          token: localStorage.getItem('token'),
          role: localStorage.getItem('userRole'),
          email: localStorage.getItem('userEmail'),
          name: localStorage.getItem('userName')
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        status: 'error',
        message: 'Failed to connect to server'
      };
    }
  },

  logout: () => {
    console.log('👋 Logging out, clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('authTimestamp');
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  changePassword: async (data) => {
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Change password error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  changeEmail: async (email) => {
  const response = await fetch(`${API_URL}/auth/change-email`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify({ email })
  });
  return await response.json();
},

  // ============ PROPERTIES ============
  getProperties: async () => {
    try {
      const response = await fetch(`${API_URL}/properties`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get properties error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getProperty: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  createProperty: async (propertyData) => {
    try {
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(propertyData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Create property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(propertyData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Update property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  deleteProperty: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Delete property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  archiveProperty: async (id, reason, notes) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}/archive`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason, notes })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Archive property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  restoreProperty: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}/restore`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Restore property error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  validateAccessCode: async (accessCode) => {
    try {
      const response = await fetch(`${API_URL}/properties/validate-access-code`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ accessCode })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Validate access code error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ TENANTS ============
  getTenants: async () => {
    try {
      console.log('📡 Fetching tenants from API...');
      const response = await fetch(`${API_URL}/tenants`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📦 Tenants API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Get tenants error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getTenant: async (id) => {
    try {
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get tenant error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  createTenant: async (tenantData) => {
    try {
      console.log('📤 Creating tenant:', tenantData);
      const response = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tenantData)
      });
      const data = await response.json();
      console.log('📡 Create tenant response:', data);
      return data;
    } catch (error) {
      console.error('❌ Create tenant error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateTenant: async (id, tenantData) => {
    try {
      console.log('📤 Updating tenant:', id, tenantData);
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(tenantData)
      });
      const data = await response.json();
      console.log('📡 Update tenant response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update tenant error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  deleteTenant: async (id) => {
    try {
      console.log('📤 Deleting tenant:', id);
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Delete tenant response:', data);
      return data;
    } catch (error) {
      console.error('❌ Delete tenant error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  markTenantAsPast: async (id) => {
    try {
      console.log('📤 Marking tenant as past:', id);
      const response = await fetch(`${API_URL}/tenants/${id}/mark-past`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Mark tenant as past response:', data);
      return data;
    } catch (error) {
      console.error('❌ Mark tenant as past error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ MAINTENANCE ============
  getMaintenanceRequests: async (status = null, priority = null) => {
    try {
      let url = `${API_URL}/maintenance`;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (params.toString()) url += `?${params.toString()}`;

      console.log('📡 Fetching maintenance requests...');
      const response = await fetch(url, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📦 Maintenance response:', data);
      return data;
    } catch (error) {
      console.error('❌ Get maintenance error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getMaintenanceRequest: async (id) => {
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get maintenance request error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  createMaintenanceRequest: async (maintenanceData) => {
    try {
      console.log('📤 Creating maintenance request:', maintenanceData);
      const response = await fetch(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(maintenanceData)
      });
      const data = await response.json();
      console.log('📡 Create maintenance response:', data);
      return data;
    } catch (error) {
      console.error('❌ Create maintenance error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateMaintenanceRequest: async (id, maintenanceData) => {
    try {
      console.log('📤 Updating maintenance request:', id);
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(maintenanceData)
      });
      const data = await response.json();
      console.log('📡 Update maintenance response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update maintenance error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  deleteMaintenanceRequest: async (id) => {
    try {
      console.log('📤 Deleting maintenance request:', id);
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Delete maintenance response:', data);
      return data;
    } catch (error) {
      console.error('❌ Delete maintenance error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateMaintenanceStatus: async (id, status, updateMessage = '') => {
    try {
      console.log('📤 Updating status:', id, status);
      const response = await fetch(`${API_URL}/maintenance/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, updateMessage })
      });
      const data = await response.json();
      console.log('📡 Update status response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update status error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ PAYMENTS ============
  getPayments: async (status = null, paymentType = null) => {
    try {
      let url = `${API_URL}/payments`;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (paymentType) params.append('paymentType', paymentType);
      if (params.toString()) url += `?${params.toString()}`;

      console.log('📡 Fetching payments...');
      const response = await fetch(url, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📦 Payments response:', data);
      return data;
    } catch (error) {
      console.error('❌ Get payments error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getPayment: async (id) => {
    try {
      const response = await fetch(`${API_URL}/payments/${id}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get payment error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  createPayment: async (paymentData) => {
    try {
      console.log('📤 Creating payment:', paymentData);
      const response = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      console.log('📡 Create payment response:', data);
      return data;
    } catch (error) {
      console.error('❌ Create payment error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updatePayment: async (id, paymentData) => {
    try {
      console.log('📤 Updating payment:', id);
      const response = await fetch(`${API_URL}/payments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      console.log('📡 Update payment response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update payment error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  deletePayment: async (id) => {
    try {
      console.log('📤 Deleting payment:', id);
      const response = await fetch(`${API_URL}/payments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Delete payment response:', data);
      return data;
    } catch (error) {
      console.error('❌ Delete payment error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getPaymentStats: async () => {
    try {
      const response = await fetch(`${API_URL}/payments/stats`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get payment stats error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ BANK DETAILS ============
  updateBankDetails: async (bankDetails) => {
    try {
      console.log('📤 Updating bank details');
      const response = await fetch(`${API_URL}/auth/bank-details`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(bankDetails)
      });
      const data = await response.json();
      console.log('📡 Update bank details response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update bank details error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getLandlordBankDetails: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/landlord-bank-details`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get landlord bank details error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getAgentBankDetails: async (agentId) => {
    try {
      const response = await fetch(`${API_URL}/auth/agent-bank-details/${agentId}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get agent bank details error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ AGENTS ============
  getAgents: async () => {
    try {
      console.log('📡 Fetching agents...');
      const response = await fetch(`${API_URL}/agents`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📦 Agents response:', data);
      return data;
    } catch (error) {
      console.error('❌ Get agents error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getAgent: async (id) => {
    try {
      const response = await fetch(`${API_URL}/agents/${id}`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get agent error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  createAgent: async (agentData) => {
    try {
      console.log('📤 Creating agent:', agentData);
      const response = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(agentData)
      });
      const data = await response.json();
      console.log('📡 Create agent response:', data);
      return data;
    } catch (error) {
      console.error('❌ Create agent error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  updateAgent: async (id, agentData) => {
    try {
      console.log('📤 Updating agent:', id);
      const response = await fetch(`${API_URL}/agents/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(agentData)
      });
      const data = await response.json();
      console.log('📡 Update agent response:', data);
      return data;
    } catch (error) {
      console.error('❌ Update agent error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  deleteAgent: async (id) => {
    try {
      console.log('📤 Deleting agent:', id);
      const response = await fetch(`${API_URL}/agents/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Delete agent response:', data);
      return data;
    } catch (error) {
      console.error('❌ Delete agent error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getAgentProperties: async (id) => {
    try {
      const response = await fetch(`${API_URL}/agents/${id}/properties`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get agent properties error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getAgentCommissions: async (id) => {
    try {
      const response = await fetch(`${API_URL}/agents/${id}/commissions`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get agent commissions error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // Get ALL registered agents (for property assignment)
  getRegisteredAgents: async () => {
    try {
      console.log('📡 Fetching all registered agents...');
      const response = await fetch(`${API_URL}/agents/registered`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📦 Registered agents response:', data);
      return data;
    } catch (error) {
      console.error('❌ Get registered agents error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // ============ NOTIFICATIONS ============
  notifyPaymentMade: async (paymentData) => {
    try {
      console.log('📤 Notifying payment made:', paymentData);
      const response = await fetch(`${API_URL}/notifications/payment-made`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      console.log('📡 Notify payment response:', data);
      return data;
    } catch (error) {
      console.error('❌ Notify payment error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getNotifications: async (status) => {
    try {
      const url = status ? `${API_URL}/notifications?status=${status}` : `${API_URL}/notifications`;
      const response = await fetch(url, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get notifications error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  getUnreadNotificationCount: async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Get unread count error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  confirmRentPayment: async (notificationId) => {
    try {
      console.log('📤 Confirming rent payment:', notificationId);
      const response = await fetch(`${API_URL}/notifications/${notificationId}/confirm-rent`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Confirm rent response:', data);
      return data;
    } catch (error) {
      console.error('❌ Confirm rent error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  confirmCommissionPayment: async (notificationId) => {
    try {
      console.log('📤 Confirming commission payment:', notificationId);
      const response = await fetch(`${API_URL}/notifications/${notificationId}/confirm-commission`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Confirm commission response:', data);
      return data;
    } catch (error) {
      console.error('❌ Confirm commission error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  agentConfirmCommission: async (notificationId) => {
    try {
      console.log('📤 Agent confirming commission:', notificationId);
      const response = await fetch(`${API_URL}/notifications/${notificationId}/agent-confirm`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 Agent confirm response:', data);
      return data;
    } catch (error) {
      console.error('❌ Agent confirm error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Mark as read error:', error);
      return { status: 'error', message: 'Failed to connect to server' };
    }
  },

  // Dashboard
getDashboardStats: async (role) => {
  const response = await fetch(`${API_URL}/dashboard/${role}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
},

// Documents
uploadDocument: async (formData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData // FormData, no Content-Type header!
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
},

getMyDocuments: async () => {
  const response = await fetch(`${API_URL}/documents/my-documents`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
},

getTenantDocuments: async (tenantId) => {
  const response = await fetch(`${API_URL}/documents/tenant/${tenantId}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
},

deleteDocument: async (docId) => {
  const response = await fetch(`${API_URL}/documents/${docId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
},

verifyEmail: async (otp) => {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ otp })
  });
  return await response.json();
},

resendOTP: async () => {
  const response = await fetch(`${API_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: getHeaders()
  });
  return await response.json();
},

search: async (query) => {
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: getHeaders()
  });
  return await response.json();
},

aiGenerateLease: async (formData) => {
  const response = await fetch(`${API_URL}/ai/lease`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formData)
  });
  return await response.json();
},

aiGetMarketInsights: async (location) => {
  const response = await fetch(`${API_URL}/ai/market`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ location })
  });
  return await response.json();
},

aiAsk: async (question) => {
  const response = await fetch(`${API_URL}/ai/ask`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ question })
  });
  return await response.json();
},

getMyTenants: async () => {
  const response = await fetch(`${API_URL}/tenants/my-tenants`, {
    headers: getHeaders()
  });
  return await response.json();
},

updateNotificationPreferences: async (prefs) => {
  try {
    const response = await fetch(`${API_URL}/auth/notification-preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(prefs)
    });
    return await response.json();
  } catch (error) {
    return { status: 'error', message: 'Failed to connect to server' };
  }
},

};