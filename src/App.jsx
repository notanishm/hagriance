import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import FarmerOnboarding from './pages/farmer/FarmerOnboarding';
import BusinessOnboarding from './pages/business/BusinessOnboarding';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BankOnboarding from './pages/bank/BankOnboarding';
import BankDashboard from './pages/bank/BankDashboard';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="app-container">
              <Header />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/roles" element={<RoleSelection />} />
              
              {/* Onboarding routes - require authentication */}
              <Route 
                path="/farmer/register" 
                element={
                  <ProtectedRoute>
                    <FarmerOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/register" 
                element={
                  <ProtectedRoute>
                    <BusinessOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bank/register" 
                element={
                  <ProtectedRoute>
                    <BankOnboarding />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected dashboard routes - role-based access */}
              <Route 
                path="/farmer/dashboard" 
                element={
                  <ProtectedRoute requiredRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/dashboard" 
                element={
                  <ProtectedRoute requiredRole="business">
                    <BusinessDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bank/dashboard" 
                element={
                  <ProtectedRoute requiredRole="bank">
                    <BankDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
