import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, UserPlus, Lock, Smartphone } from 'lucide-react';
import './Landing.css';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await api.get(`auth/invite/validate/${token}/`);
        setInvitation(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post(`auth/invite/accept/${token}/`, {
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
      setError(err.response?.data?.error || 'Failed to create your profile. Please try again.');
      toast.error('Registration failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="landing-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '1.2rem' }}>Verifying your invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px' }}>
        <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Invitation Error</h2>
          <p style={{ color: 'var(--landing-text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>{error}</p>
          <button className="landing-btn landing-btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', padding: '40px', maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(246, 139, 31, 0.1)', color: 'var(--accent-orange, #f68b1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <UserPlus size={28} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem' }}>Complete Your Profile</h2>
          <p style={{ color: 'var(--landing-text-muted)', margin: 0 }}>
            You've been invited to join as a <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{invitation.role}</strong> using <strong style={{ color: '#fff' }}>{invitation.email}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="landing-contact-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="first_name">First Name</label>
              <input 
                type="text" 
                id="first_name" 
                required 
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="last_name">Last Name</label>
              <input 
                type="text" 
                id="last_name" 
                required 
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ paddingLeft: '40px' }}
              />
              <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="confirm_password" 
                required 
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--landing-text-muted)' }} />
            </div>
          </div>

          <button type="submit" disabled={submitLoading} className="landing-btn landing-btn-primary landing-btn-block" style={{ marginTop: '24px' }}>
            {submitLoading ? 'Registering Account...' : 'Create Account & Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvite;
