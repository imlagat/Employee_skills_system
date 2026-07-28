import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building, Briefcase, 
  BookOpen, Target, GraduationCap, Award,
  Activity, TrendingUp, Network, Compass, LayoutGrid,
  BarChart2, PieChart,
  Bell, Settings, Menu, X, FileText, CheckSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      toggleSidebar();
    }
  };


  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { label: 'HR Requests', icon: <FileText size={18} />, path: '/hr-requests', employeeOnly: true },
        { label: 'HR Approvals', icon: <CheckSquare size={18} />, path: '/hr-approvals', restricted: true }
      ]
    },
    {
      title: 'People',
      restricted: true,
      items: [
        { label: 'Employees', icon: <Users size={18} />, path: '/people/employees' },
        { label: 'Skills Heatmap', icon: <LayoutGrid size={18} />, path: '/people/skills-matrix' },
        { label: 'Departments', icon: <Building size={18} />, path: '/people/departments' },
        { label: 'Positions', icon: <Briefcase size={18} />, path: '/people/positions' }
      ]
    },
    {
      title: 'Learning & Development',
      items: [
        { label: 'Skills Catalog', icon: <BookOpen size={18} />, path: '/learning/skills' },
        { label: 'Competency Framework', icon: <Target size={18} />, path: '/learning/competencies', restricted: true },
        { label: 'Assessments', icon: <Activity size={18} />, path: '/performance/assessments', restricted: true },
        { label: 'Succession Planning', icon: <Network size={18} />, path: '/performance/succession', restricted: true },
        { label: 'Training Programs', icon: <GraduationCap size={18} />, path: '/learning/training' },
        { label: 'Certifications', icon: <Award size={18} />, path: '/learning/certifications' },
        { label: 'Gig Marketplace', icon: <Briefcase size={18} />, path: '/learning/gigs' },
        { label: 'Career Pathing', icon: <Compass size={18} />, path: '/learning/career-pathing' },
      ]
    },
    {
      title: 'Analytics',
      restricted: true,
      items: [
        { label: 'Reports & Insights', icon: <BarChart2 size={18} />, path: '/analytics/reports' }
      ]
    },
    {
      title: 'Administration',
      restricted: true,
      items: [
        { label: 'User Management', icon: <Users size={18} />, path: '/admin/users' },
        { label: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <aside className={`enterprise-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">§</div>
            <span className="logo-text">SkillMatrix</span>
          </div>
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav-container">
          {navGroups.map((group, idx) => {
            // Hide restricted groups from standard employees
            if (group.restricted && user?.role === 'employee') return null;

            // Filter out restricted items within non-restricted groups
            const visibleItems = group.items.filter(item => {
              if (item.restricted && user?.role === 'employee') return false;
              if (item.employeeOnly && (user?.role === 'admin' || user?.role === 'hr')) return false;
              return true;
            });
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="nav-group">
                <div className="nav-group-title">{group.title}</div>
                <ul className="nav-list">
                  {visibleItems.map((item, i) => (
                    <li key={i} className="nav-item">
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
