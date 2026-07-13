import React, { useState, useContext } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-left-content">
            
            <div className="login-logo">
              Skill<span>Matrix.</span>
            </div>
            
            <div className="login-header">
              <h2>Verify your email</h2>
              <p>Enter the 6-digit code sent to {email}</p>
            </div>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="000000"
                  maxLength={6}
                  style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>
              
              <button type="submit" className="btn-login" disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                Didn't receive the code? <button type="button" onClick={() => toast.success('A new code has been sent.')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer', padding: 0 }}>Resend</button>
              </div>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
