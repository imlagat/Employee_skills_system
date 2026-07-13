import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Briefcase, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Login.css';

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
              <div className="feature-icon"><Award size={20} color="#fff" /></div>
              <span>Comprehensive Skills Tracking & Gap Analysis</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Briefcase size={20} color="#fff" /></div>
              <span>Automated Training & Certification Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><TrendingUp size={20} color="#fff" /></div>
              <span>AI-Powered Promotion Readiness Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="auth-section">
        <div className="login-card">
          <div className="login-header">
            <h2>Create Account</h2>
            <p>Sign up to start managing your workforce</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>First Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Last Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="johndoe123"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Set your password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="show-password-container">
              <input 
                type="checkbox" 
                id="showPassword" 
                checked={showPassword} 
                onChange={(e) => setShowPassword(e.target.checked)} 
              />
              <label htmlFor="showPassword">Show password</label>
            </div>
            
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
              Already have an account? <a href="/login" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'none' }}>Sign in</a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
