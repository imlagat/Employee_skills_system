import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, Menu, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import './Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ employees: [], skills: [], departments: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/');
      const notifs = res.data.results || res.data;
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error("Failed to fetch unread count:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const [empRes, skillRes, depRes] = await Promise.all([
            api.get(`/employees/?search=${searchQuery}`),
            api.get(`/skills/?search=${searchQuery}`),
            api.get(`/departments/?search=${searchQuery}`)
          ]);
          setSearchResults({
            employees: empRes.data.results || empRes.data || [],
            skills: skillRes.data.results || skillRes.data || [],
            departments: depRes.data.results || depRes.data || []
          });
          setShowDropdown(true);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ employees: [], skills: [], departments: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="enterprise-topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="global-search" ref={searchRef}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employees, skills, or departments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.length > 1) setShowDropdown(true); }}
          />
          
          {showDropdown && (
            <div className="search-dropdown">
              {isSearching ? (
                <div className="search-loading">Searching...</div>
              ) : (
                <>
                  {searchResults.employees.length > 0 && (
                    <div className="search-section">
                      <h4>Employees</h4>
                      {searchResults.employees.slice(0,3).map(emp => (
                        <div key={emp.id} className="search-item" onClick={() => { navigate(`/people/employees`); setShowDropdown(false); }}>
                          <strong>{emp.user?.first_name || emp.user?.username} {emp.user?.last_name}</strong> - <span style={{fontSize:'0.8rem', color:'#aaa'}}>{emp.position?.name || 'Employee'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.skills.length > 0 && (
                    <div className="search-section">
                      <h4>Skills</h4>
                      {searchResults.skills.slice(0,3).map(skill => (
                        <div key={skill.id} className="search-item" onClick={() => { navigate(`/learning/skills`); setShowDropdown(false); }}>
                          <strong>{skill.name}</strong> - <span style={{fontSize:'0.8rem', color:'#aaa'}}>{skill.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.departments.length > 0 && (
                    <div className="search-section">
                      <h4>Departments</h4>
                      {searchResults.departments.slice(0,3).map(dep => (
                        <div key={dep.id} className="search-item" onClick={() => { navigate(`/people/departments`); setShowDropdown(false); }}>
                          <strong>{dep.name}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.employees.length === 0 && searchResults.skills.length === 0 && searchResults.departments.length === 0 && (
                    <div className="search-empty">No results found for "{searchQuery}"</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <Link to="/admin/notifications" className="notification-btn" title="Notifications" style={{ color: 'inherit', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bell size={20} className="bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-dot">
              <span className="ping-ring"></span>
            </span>
          )}
        </Link>
        
        {user ? (
          <div className="user-profile-menu">
            <Link to="/admin/settings" state={{ activeTab: 'profile' }} className="avatar-link">
              <div className="google-avatar-ring">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div className="user-info-desktop">
              <span className="user-name">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
              </span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="icon-btn-dark logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button className="btn-primary-dark">Admin Profile</button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
