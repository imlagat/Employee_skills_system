import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, UserPlus, Sparkles, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { ThemeContext } from '../context/ThemeContext';
import './Login.css';
import './Landing.css';

const Signup = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('auth/signup/', formData);
      toast.success('Registration successful. Please check your email.');
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      toast.error(errMsg);
      
      const lowerErr = errMsg.toLowerCase();
      if (
        lowerErr.includes('already registered') || 
        lowerErr.includes('already exists') || 
        lowerErr.includes('email is already') || 
        lowerErr.includes('account already')
      ) {
        setTimeout(() => {
          navigate('/login', { state: { username: formData.email || formData.username } });
        }, 1500);
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
                padding: '30px', 
                maxWidth: '500px', 
                width: '100%', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(246, 139, 31, 0.1)', color: 'var(--accent-orange, #f68b1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <UserPlus size={20} />
                  </div>
                  <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0' }}>Create Account</h2>
                  <p style={{ color: 'var(--landing-text-muted)', margin: 0, fontSize: '0.9rem' }}>Set up your organizational skill profile</p>
                </div>
 
                <form className="landing-contact-form" onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>First Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Last Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                      />
                    </div>
                  </div>
 
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Username</label>
                      <input 
                        type="text" 
                        required
                        placeholder="johndoe12"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Role</label>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: '#111827', color: '#fff', cursor: 'pointer' }}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>
 
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Password</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                    />
                  </div>
 
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="checkbox" 
                      id="showPassword" 
                      checked={showPassword} 
                      onChange={(e) => setShowPassword(e.target.checked)} 
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent-orange, #f68b1f)', cursor: 'pointer' }}
                    />
                    <label htmlFor="showPassword" style={{ fontSize: '0.8rem', color: 'var(--landing-text-muted)', cursor: 'pointer', fontWeight: '500' }}>Show password</label>
                  </div>
 
                  <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" disabled={isLoading} style={{ padding: '10px' }}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>
 
                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
                  </div>
                </form>
 
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
