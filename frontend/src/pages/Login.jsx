import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { Lock, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';
import './Login.css';
import './Landing.css';

const Login = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // OAuth flow logic here
      } catch (err) {
        toast.error('Google login failed');
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login failed');
    }
  });

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.is_email_verified === false) {
        toast.error('Email not verified. A verification code has been sent.');
        navigate('/verify-email', { state: { email: err.response.data.email } });
      } else {
        setError(err.response?.data?.detail || err.response?.data?.error || 'Invalid username or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
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

          <button className="landing-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            
            <div className="landing-nav-ctas" style={{ display: 'flex', alignItems: 'center' }}>
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

              <Link to="/login" className="landing-btn landing-btn-outline" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="landing-btn landing-btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Split Layout Section */}
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
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Join SkillMatrix</h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Sign in to access your talent dashboard</p>
                </div>
 
                <div style={{ padding: '24px' }}>
                  {error && <div className="login-error" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
 
                  <form className="landing-contact-form" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label htmlFor="login-username" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Username or Email</label>
                      <input 
                        type="text" 
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="johndoe"
                        autoComplete="username"
                        style={{ width: '100%', padding: '10px 20px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                      />
                    </div>
 
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label htmlFor="login-password" style={{ fontSize: '0.85rem', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Password</label>
                        <Link to="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--accent-orange, #f68b1f)', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        autoComplete="current-password"
                        style={{ width: '100%', padding: '10px 20px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                      />
                    </div>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
                      <input 
                        type="checkbox" 
                        id="showPassword" 
                        checked={showPassword} 
                        onChange={(e) => setShowPassword(e.target.checked)} 
                        style={{ width: '15px', height: '15px', accentColor: 'var(--accent-orange, #f68b1f)', cursor: 'pointer' }}
                      />
                      <label htmlFor="showPassword" style={{ fontSize: '0.8rem', color: 'var(--landing-text-muted)', cursor: 'pointer', fontWeight: '500' }}>Show password</label>
                    </div>
 
                    <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '24px' }}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
 
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}>
                      Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
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

export default Login;
