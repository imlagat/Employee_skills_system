import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--light-gray)' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // Enforce admin verification/approval
  if (user.role !== 'admin' && !user.is_active_employee) {
    return (
      <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0b0f19', color: '#fff' }}>
        <div className="login-card" style={{ 
          background: 'var(--landing-card)', 
          border: '1px solid var(--landing-border)', 
          borderRadius: '16px', 
          padding: '40px', 
          maxWidth: '540px', 
          width: '100%', 
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ color: 'var(--accent-orange, #f68b1f)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px' }}>Account Awaiting Approval</h2>
          <p style={{ color: 'var(--landing-text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Thank you for completing your profile! Your account is currently awaiting verification by a system administrator.
          </p>
          <p style={{ color: 'var(--landing-text-muted)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Once approved, you will be granted access to the SkillMatrix dashboard.
          </p>
          <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => logout()} style={{ padding: '12px' }}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Admin bypass
  if (user.role === 'admin') {
    if (location.pathname === '/complete-profile') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // Enforce profile completion
  if (!user.has_completed_profile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Don't allow access to complete profile if already done
  if (user.has_completed_profile && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
