import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, UserPlus, Lock, Smartphone, Key, Mail, User, Sun, Moon, Sparkles } from 'lucide-react';
import './Login.css';
import './Landing.css';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [code, setCode] = useState(token || '');
  const [invitation, setInvitation] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (inviteCode) => {
    if (!inviteCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`auth/invite/validate/${inviteCode}/`);
      setInvitation(res.data);
      setIsVerified(true);
      
      const emailVal = res.data.email || '';
      setFormData(prev => ({
        ...prev,
        email: emailVal,
        username: emailVal.split('@')[0]
      }));
      toast.success('Invitation verified!');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired invitation code.');
      toast.error('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (e) => {
    e.preventDefault();
    if (code.trim()) {
      validateToken(code.trim());
    } else {
      toast.error('Please enter an invitation code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitLoading(true);
    try {
      const activeCode = token || code.trim();
      const response = await api.post(`auth/invite/accept/${activeCode}/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      });

      // Save tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Fetch fresh user data and set context
      const userRes = await api.get('auth/me/');
      setUser(userRes.data);

      toast.success('Account created successfully! Welcome to SkillMatrix.');
      navigate('/dashboard');
    } catch (err) {
      const apiErr = err.response?.data?.error || 'Failed to create your profile. Please try again.';
      setError(apiErr);
      toast.error(apiErr);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
      
      {/* Topbar Header */}
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

      {/* Hero Body Split Section */}
      <div className="auth-hero" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '30px 0' }}>
        <div className="landing-container" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            
            {/* Left side text */}
            <div className="hero-text-content" style={{ textAlign: 'left' }}>
              <div className="hero-badge">
                <Sparkles size={14} /> AI-Powered Talent Mobility
              </div>
              <h1>Map. Verify. Scale. Your Team's Skill Matrix.</h1>
              <p>
                Unify employee talents, verify certifications, identify competency gaps, and build robust succession plans. All powered by Google Gemini AI-driven insights.
              </p>
            </div>

            {/* Right side invitation card */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="login-card" style={{ 
                background: 'var(--landing-card)', 
                border: '1px solid var(--landing-border)', 
                borderRadius: '16px', 
                padding: 0, 
                maxWidth: '440px', 
                width: '100%', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                
                <div style={{ background: 'linear-gradient(135deg, var(--accent-orange, #f68b1f) 0%, #ff5a36 100%)', padding: '24px', textAlign: 'center' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Join SkillMatrix</h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    {!isVerified ? 'Enter invitation code to get started' : `Complete your profile registration`}
                  </p>
                </div>

                <div style={{ padding: '24px' }}>
                  {error && <div className="login-error" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ color: 'var(--landing-text-muted)', fontSize: '0.95rem' }}>Verifying invitation credentials...</p>
                    </div>
                  ) : !isVerified ? (
                    /* Phase 1: Enter Invitation Code manually */
                    <form onSubmit={handleVerifyClick} className="landing-contact-form">
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Invitation Code</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            placeholder="Enter the code sent to your email"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{ width: '100%', padding: '10px 20px 10px 40px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                          <Key size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                        </div>
                      </div>
                      <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" style={{ padding: '10px 20px', borderRadius: '24px' }}>
                        Verify Invitation Code
                      </button>
                    </form>
                  ) : (
                    /* Phase 2: Fill registration details */
                    <form onSubmit={handleSubmit} className="landing-contact-form">
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>First Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="John"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            style={{ width: '100%', padding: '10px 16px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Last Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            style={{ width: '100%', padding: '10px 16px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="email" 
                            required 
                            placeholder="colleague@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                          <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Choose Username</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            required 
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                          <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Phone Number (Optional)</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="tel" 
                            placeholder="+254 712 345678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                          />
                          <Smartphone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? "text" : "password"} 
                              required 
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '4px', fontWeight: '600' }}>Confirm Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? "text" : "password"} 
                              required 
                              placeholder="••••••••"
                              value={formData.confirm_password}
                              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                              style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: '24px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
                          </div>
                        </div>
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

                      <button type="submit" disabled={submitLoading} className="landing-btn landing-btn-primary landing-btn-block" style={{ padding: '10px 20px', borderRadius: '24px' }}>
                        {submitLoading ? 'Registering Account...' : 'Create Account & Log In'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
