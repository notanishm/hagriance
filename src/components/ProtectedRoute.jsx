import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_CACHE_KEY = 'agriance_cached_profile';

/**
 * Protected Route Component
 * Requires authentication and optionally a specific role
 * Falls back to localStorage cached profile for demo
 */
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(45, 90, 39, 0.1)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Try to get profile: from context first, then localStorage fallback
  let effectiveProfile = userProfile;
  if (!effectiveProfile) {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) effectiveProfile = JSON.parse(cached);
    } catch (e) { /* ignore */ }
  }

  // Check role if required
  if (requiredRole && effectiveProfile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    const rolePaths = {
      farmer: '/farmer/dashboard',
      business: '/business/dashboard',
      bank: '/bank/dashboard',
    };

    const redirectPath = rolePaths[effectiveProfile?.role] || '/roles';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * Public Route Component
 * Redirects authenticated users to their dashboard
 */
export const PublicRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(45, 90, 39, 0.1)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Try to get profile: from context first, then localStorage fallback
  let effectiveProfile = userProfile;
  if (!effectiveProfile) {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) effectiveProfile = JSON.parse(cached);
    } catch (e) { /* ignore */ }
  }

  // Redirect authenticated users to their dashboard
  if (user && effectiveProfile) {
    const rolePaths = {
      farmer: '/farmer/dashboard',
      business: '/business/dashboard',
      bank: '/bank/dashboard',
    };

    const redirectPath = rolePaths[effectiveProfile.role] || '/roles';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
