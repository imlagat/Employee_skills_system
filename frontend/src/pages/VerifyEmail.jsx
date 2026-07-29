import React, { useState, useContext } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Key, Sparkles, Sun, Moon } from 'lucide-react';
import './Login.css';
import './Landing.css';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('auth/verify-otp/', { email, otp });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Fetch fresh user data
      const res = await api.get('auth/me/');
      setUser(res.data);
      
      toast.success('Email verified successfully!');
      navigate('/complete-profile');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed. Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('auth/resend-otp/', { email });
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send a new verification code. Please try again.');
    }
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
      
      {/* Topbar Navigation */}
      <header className="landing-header">
        <div className="landing-container nav-flex">
          <Link to="/" className="landing-logo" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f68b1f" />
                  <stop offset="100%" stopColor="#ff5a36" />
                </linearGradient>
              </defs>
              <circle cx="8" cy="8" r="4.5" fill="url(#logo-grad)" />
              <circle cx="24" cy="8" r="3.5" fill="url(#logo-grad)" fillOpacity="0.7" />
              <circle cx="16" cy="24" r="5.5" fill="url(#logo-grad)" />
              <line x1="8" y1="8" x2="24" y2="8" stroke="url(#logo-grad)" strokeWidth="2.5" strokeDasharray="2 2" />
              <line x1="8" y1="8" x2="16" y2="24" stroke="url(#logo-grad)" strokeWidth="2.5" />
              <line x1="24" y1="8" x2="16" y2="24" stroke="url(#logo-grad)" strokeWidth="2.5" />
            </svg>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--landing-text-main)', letterSpacing: '-0.5px' }}>SkillMatrix</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              type="button"
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              style={{
                background: 'transparent',
                border: '1px solid var(--landing-border)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--landing-text-main)',
                transition: 'all 0.2s',
                marginRight: '12px'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="landing-btn landing-btn-outline">Login</Link>
          </div>
        </div>
      </header>

      {/* Main Form Section */}
      <div className="auth-hero" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '30px 0' }}>
        <div className="landing-container" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            
            {/* Left Side Content */}
            <div className="hero-text-content" style={{ textAlign: 'left' }}>
              <div className="hero-badge">
                <Sparkles size={14} /> AI-Powered Talent Mobility
              </div>
              <h1>Map. Verify. Scale. Your Team's Skill Matrix.</h1>
              <p>
                Unify employee talents, verify certifications, identify competency gaps, and build robust succession plans. All powered by Google Gemini AI-driven insights.
              </p>
            </div>

            {/* Right Side Form Card */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="login-card" style={{ 
                background: 'var(--landing-card)', 
                border: '1px solid var(--landing-border)', 
                borderRadius: '16px', 
                padding: 0, 
                maxWidth: '380px', 
                width: '100%', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                
                <div style={{ background: 'linear-gradient(135deg, var(--accent-orange, #f68b1f) 0%, #ff5a36 100%)', padding: '24px', textAlign: 'center' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Verify Your Email</h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Enter the 6-digit code sent to {email}</p>
                </div>
 
                <div style={{ padding: '24px' }}>
                  <form className="landing-contact-form" onSubmit={handleSubmit}>
                    
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Verification Code</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          maxLength="6"
                          placeholder="000000"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          style={{ 
                            width: '100%', 
                            padding: '10px 16px 10px 36px', 
                            borderRadius: '24px', 
                            border: '1px solid var(--landing-border)', 
                            background: 'rgba(255,255,255,0.02)', 
                            color: '#fff',
                            letterSpacing: '6px',
                            textAlign: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                          }}
                        />
                        <Key size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                      </div>
                    </div>
                    
                    <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" disabled={isLoading || otp.length !== 6} style={{ padding: '10px 20px', borderRadius: '24px' }}>
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}>
                      Didn't receive the code? <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', cursor: 'pointer', padding: 0 }}>Resend Code</button>
                    </div>

                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
