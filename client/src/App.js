import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/Home";
import AuthPage from "./pages/auth/Authpage";
import DashboardLayout from "./components/Dashboardlayout";
import ProtectedRoute from "./components/Protectedroute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/get-started" element={<HomePage />} />
        <Route path="/auth/:role" element={<AuthPage />} />
        
        <Route path="/dashboard/landlord" element={
          <ProtectedRoute requiredRole="landlord">
            <DashboardLayout userRole="landlord" />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/tenant" element={
          <ProtectedRoute requiredRole="tenant">
            <DashboardLayout userRole="tenant" />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/agent" element={
          <ProtectedRoute requiredRole="agent">
            <DashboardLayout userRole="agent" />
          </ProtectedRoute>
        } />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;