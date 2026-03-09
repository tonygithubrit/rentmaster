import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');

  // If no user is logged in, redirect to home page
  if (!token || !userRole || !userEmail) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // If user is logged in but trying to access wrong dashboard, redirect to their dashboard
  if (requiredRole && userRole !== requiredRole) {
    console.log(`⚠️ Wrong dashboard. User role: ${userRole}, Required: ${requiredRole}`);
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  console.log('✅ Access granted to dashboard');
  // User is authenticated and accessing correct dashboard
  return children;
};

export default ProtectedRoute;