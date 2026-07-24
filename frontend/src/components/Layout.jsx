import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatbox from './AIChatbox';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isImpersonating, restoreAdmin } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRestoreAdmin = async () => {
    try {
      await restoreAdmin();
      toast.success("Returned to Admin Account!");
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore admin account.");
    }
  };

  return (
    <div className="enterprise-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {isImpersonating && (
        <div style={{
          backgroundColor: '#f59e0b',
          color: '#000000',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          zIndex: 1000,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You are currently logged in as: <strong>{user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</strong> ({user?.role?.toUpperCase()})</span>
          </div>
          <button 
            onClick={handleRestoreAdmin}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#222222'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#000000'}
          >
            Return to Admin Account
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Topbar toggleSidebar={toggleSidebar} />
          <main className="layout-content">
            {children}
          </main>
          <AIChatbox />
        </div>
      </div>
    </div>
  );
};

export default Layout;
