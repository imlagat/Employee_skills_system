import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatbox from './AIChatbox';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="enterprise-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="layout-content">
          {children}
        </main>
        <AIChatbox />
      </div>
    </div>
  );
};

export default Layout;
