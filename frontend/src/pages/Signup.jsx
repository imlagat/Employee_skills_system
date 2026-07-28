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
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px', background: '#ffffff' }}>
      
      {/* Topbar Navigation */}
      <header className="landing-header" style={{ background: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid #e2e8f0' }}>
        <div className="landing-container nav-flex">
          <Link to="/" className="landing-logo" style={{ color: '#0f172a' }}>
            <div className="landing-logo-icon">§</div>
            <span>SkillMatrix</span>
          </Link>

          <button className="landing-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ color: '#0f172a' }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ background: isMobileMenuOpen ? '#ffffff' : 'transparent' }}>
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569' }}>Features</a>
            <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569' }}>About Us</a>
            <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569' }}>FAQ</a>
            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#475569' }}>Contact</a>
            
            <div className="landing-nav-ctas">
              <Link to="/login" className="landing-btn landing-btn-outline" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
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
          background: '#ffffff', 
          border: '1px solid #cbd5e1', 
          borderRadius: '16px', 
          padding: '40px', 
          maxWidth: '500px', 
          width: '100%', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(246, 139, 31, 0.1)', color: 'var(--accent-orange, #f68b1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <UserPlus size={24} />
            </div>
            <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>Create Account</h2>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>Set up your organizational skill profile</p>
          </div>

          <form className="landing-contact-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>First Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>Last Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="johndoe12"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', cursor: 'pointer' }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" 
                required
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
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
              <label htmlFor="showPassword" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>Show password</label>
            </div>

            <button type="submit" className="landing-btn landing-btn-primary landing-btn-block" disabled={isLoading} style={{ padding: '12px' }}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#475569' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
