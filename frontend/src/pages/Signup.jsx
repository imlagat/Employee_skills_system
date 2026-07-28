import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Login.css';
import './Landing.css';

const Signup = () => {
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
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
      
      {/* Topbar Navigation */}
      <header className="landing-header">
        <div className="landing-container nav-flex">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">§</div>
            <span>SkillMatrix</span>
          </Link>

          <button className="landing-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            
            <div className="landing-nav-ctas">
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

      {/* Main Centered Signup Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div className="login-card" style={{ 
          background: 'var(--landing-card)', 
          border: '1px solid var(--landing-border)', 
          borderRadius: '16px', 
          padding: '40px', 
          maxWidth: '500px', 
          width: '100%', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(246, 139, 31, 0.1)', color: 'var(--accent-orange, #f68b1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <UserPlus size={24} />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>Create Account</h2>
            <p style={{ color: 'var(--landing-text-muted)', margin: 0, fontSize: '0.95rem' }}>Set up your organizational skill profile</p>
          </div>

          <form className="landing-contact-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>First Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Last Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="johndoe12"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: '#111827', color: '#fff', cursor: 'pointer' }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" 
                required
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="checkbox" 
                id="showPassword" 
                checked={showPassword} 
                onChange={(e) => setShowPassword(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-orange, #f68b1f)', cursor: 'pointer' }}
              />
              <label htmlFor="showPassword" style={{ fontSize: '0.85rem', color: 'var(--landing-text-muted)', cursor: 'pointer', fontWeight: '500' }}>Show password</label>
            </div>

            <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" disabled={isLoading} style={{ padding: '12px' }}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--landing-text-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
