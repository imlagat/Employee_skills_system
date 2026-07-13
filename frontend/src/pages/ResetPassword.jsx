import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Login.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post('auth/reset-password/', { email });
      setIsSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* Left Side - Landing Hero */}
      <div className="landing-hero">
        <div className="hero-content">
          <div className="hero-logo">
            Skill<span>Matrix.</span>
          </div>
          <h1 className="hero-title">Elevate Your Workforce</h1>
          <p className="hero-subtitle">
            The complete Employee Skills and Management System. Track competencies, manage training enrollments, and identify promotion readiness all in one unified platform.
          </p>
          
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
              <span>Comprehensive Skills Tracking & Gap Analysis</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
              <span>Automated Training & Certification Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></div>
              <span>AI-Powered Promotion Readiness Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="auth-section">
        <div className="login-card">
          <div className="login-header">
            {!isSubmitted ? (
              <>
                <h2>Reset Password</h2>
                <p>Enter your email to receive reset instructions</p>
              </>
            ) : (
              <>
                <h2>Check your email</h2>
                <p>We've sent password reset instructions to <strong>{email}</strong></p>
              </>
            )}
          </div>
          
          {!isSubmitted ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your registered email"
                />
              </div>
              
              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                Remember your password? <a href="/login" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'none' }}>Sign in</a>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#22c55e' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <button onClick={() => navigate('/login')} className="btn-login" style={{ width: '100%' }}>
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
