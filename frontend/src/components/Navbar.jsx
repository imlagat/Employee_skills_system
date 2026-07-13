import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  if (currentPath === '/login') {
    return null; // Don't show navbar on login page
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="global-dark-navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="nav-container-single">
        <Link to="/" className="logo-dark">
          <div className="logo-icon-dark">§</div>
          <span>SkillMatrix</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links-row ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {user?.role !== 'employee' && (
            <>
              <Link to="/employees" className={currentPath === '/employees' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Employees</Link>
              <Link to="/departments" className={currentPath === '/departments' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Departments</Link>
              <Link to="/positions" className={currentPath === '/positions' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Positions</Link>
            </>
          )}
          <Link to="/skills" className={currentPath === '/skills' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Skills</Link>
          {user?.role !== 'employee' && (
            <Link to="/competencies" className={currentPath === '/competencies' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Competencies</Link>
          )}
          <Link to="/training" className={currentPath === '/training' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Training</Link>
          <Link to="/certifications" className={currentPath === '/certifications' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Certifications</Link>
          {user?.role !== 'employee' && (
            <>
              <Link to="/assessments" className={currentPath === '/assessments' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Assessments</Link>
              <Link to="/reports" className={currentPath === '/reports' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Reports</Link>
              <Link to="/notifications" className={currentPath === '/notifications' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Notifications</Link>
            </>
          )}
          <Link to="/settings" className={currentPath === '/settings' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
          
          {/* Move Profile to mobile menu on small screens */}
          <div className="mobile-only-profile">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontWeight: 500 }}>{user.username}</span>
                <button className="icon-btn-dark" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="nav-profile-dark desktop-only-profile">
          <button className="icon-btn-dark"><Search size={20} /></button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
              <button className="icon-btn-dark" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
              <Link to="/settings" state={{ activeTab: 'profile' }} style={{ cursor: 'pointer' }}>
                <div className="google-avatar-ring">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--bg-dark)', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-dark)', color: 'var(--white, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', border: '2px solid var(--bg-dark)' }}>
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <button className="btn-primary-dark">Admin Profile</button>
          )}
        </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under the fixed navbar */}
      <div style={{ height: '70px' }}></div>
    </>
  );
};

export default Navbar;
