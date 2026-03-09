import { api } from './utils/api';

// Test function
export const testBackend = async () => {
  try {
    // Test health endpoint
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Backend Health Check:', data);
    
    return data.status === 'success';
  } catch (error) {
    console.error('❌ Backend Connection Failed:', error);
    return false;
  }
};

// Call this in your browser console to test
window.testBackend = testBackend;