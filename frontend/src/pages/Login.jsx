import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Menu, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';
import './Landing.css';

const Login = () => {
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
      setError('Invalid username or password. Please try again.');
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

      {/* Main Centered Login Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="login-card" style={{ 
          background: 'var(--landing-card)', 
          border: '1px solid var(--landing-border)', 
          borderRadius: '16px', 
          padding: '40px', 
          maxWidth: '430px', 
          width: '100%', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(246, 139, 31, 0.1)', color: 'var(--accent-orange, #f68b1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Lock size={24} />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>Join SkillMatrix</h2>
            <p style={{ color: 'var(--landing-text-muted)', margin: 0, fontSize: '0.95rem' }}>Sign in to access your talent dashboard</p>
          </div>

          {error && <div className="login-error" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>{error}</div>}

          <form className="landing-contact-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="login-username" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Username or Email</label>
              <input 
                type="text" 
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="johndoe"
                autoComplete="username"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--landing-text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--landing-border)' }}></div>
              <span style={{ padding: '0 10px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--landing-border)' }}></div>
            </div>

            <button 
              type="button" 
              className="landing-btn landing-btn-outline landing-btn-block"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--landing-text-muted)' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-orange, #f68b1f)', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
