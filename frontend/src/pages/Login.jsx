import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { Award, Briefcase, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      setError('Invalid username or password. Please try again.');
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
            <h2>Join us</h2>
            <p>Sign in now and start your improvement</p>
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Set your password</label>
                <a href="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--accent-orange, #f68b1f)', fontWeight: '600', textDecoration: 'none' }}>Forgot?</a>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="divider">OR</div>
            
            <button 
              type="button" 
              className="btn-google"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
              Don't have an account? <a href="/signup" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'none' }}>Sign up</a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
