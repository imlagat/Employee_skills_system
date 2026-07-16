import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Shield, Sliders, Moon, Sun, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';
  const fileInputRef = useRef(null);
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'appearance');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', email: '', phone: '', position: '', bio: '', profile_image_preview: null, profile_image_file: null,
    blood_group: '', allergies: '', chronic_illnesses: '', next_of_kin_relationship: '', next_of_kin_name: '', next_of_kin_phone: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    assessmentReminders: true,
    weeklyReports: false
  });

  useEffect(() => {
    if (activeTab === 'profile') {
      api.get('/employees/me/').then(res => {
        const d = res.data;
        setProfileData({
          first_name: d.user?.first_name || user?.first_name || user?.username || '',
          last_name: d.user?.last_name || user?.last_name || '',
          email: d.user?.email || user?.email || '',
          phone: d.phone || '',
          position: d.position?.name || 'Unassigned',
          bio: d.bio || '',
          profile_image_preview: d.user?.profile_image || d.profile_image || null,
          profile_image_file: null,
          blood_group: d.blood_group || '',
          allergies: d.allergies || '',
          chronic_illnesses: d.chronic_illnesses || '',
          next_of_kin_relationship: d.next_of_kin_relationship || '',
          next_of_kin_name: d.next_of_kin_name || '',
          next_of_kin_phone: d.next_of_kin_phone || ''
        });
      }).catch(e => console.error("Could not fetch profile", e));
    }
  }, [activeTab, user]);

  const handleProfileSave = async () => {
    const formData = new FormData();
    formData.append('first_name', profileData.first_name);
    formData.append('last_name', profileData.last_name);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);
    formData.append('bio', profileData.bio);
    formData.append('blood_group', profileData.blood_group);
    formData.append('allergies', profileData.allergies);
    formData.append('chronic_illnesses', profileData.chronic_illnesses);
    formData.append('next_of_kin_relationship', profileData.next_of_kin_relationship);
    formData.append('next_of_kin_name', profileData.next_of_kin_name);
    formData.append('next_of_kin_phone', profileData.next_of_kin_phone);
    if (profileData.profile_image_file) {
      formData.append('profile_image', profileData.profile_image_file);
    }
    
    try {
      const response = await api.patch('/employees/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile synced to database successfully!');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (e) {
      toast.error('Failed to save profile');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profile_image_file: file,
        profile_image_preview: URL.createObjectURL(file)
      });
    }
  };
  
  const handleSave = () => {
    // In a real app, this would save to user preferences in DB
    toast.success("Settings saved successfully!");
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <>
            <div className="settings-section-header">
              <h3>My Profile</h3>
              <p>Manage your personal information and avatar.</p>
            </div>
            
            <div className="profile-edit-container">
              <div className="profile-avatar-section">
                <div className="google-avatar-ring large" onClick={() => profileData.profile_image_preview && setIsPreviewOpen(true)} style={{ cursor: profileData.profile_image_preview ? 'pointer' : 'default' }} title={profileData.profile_image_preview ? "Click to view full image" : ""}>
                  {profileData.profile_image_preview ? (
                    <img src={profileData.profile_image_preview} alt="Profile" className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-img" style={{ background: 'var(--bg-dark)', color: 'var(--white, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                      {profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : (user?.username?.charAt(0).toUpperCase() || '?')}
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <button className="settings-btn-save" onClick={() => fileInputRef.current.click()} style={{ marginTop: '15px', padding: '6px 16px', fontSize: '0.9rem' }}>Upload Photo</button>
              </div>
              
              <div className="profile-details-section employee-form">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={user?.username || 'admin'} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} title="Your registered username cannot be changed" />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Job Title / Role</label>
                  <input type="text" value={user?.role === 'admin' ? 'System Administrator' : 'Employee'} readOnly style={{ opacity: 0.8 }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Bio</label>
                  <textarea rows="3" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})}></textarea>
                </div>

                {/* Part 2: Medical Bio Data */}
                <div style={{ gridColumn: '1 / -1', margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>🩺 Medical Bio Data</h4>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input type="text" placeholder="e.g. B+, O-" value={profileData.blood_group} onChange={e => setProfileData({...profileData, blood_group: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Allergies</label>
                  <input type="text" placeholder="e.g. dust, penicillin" value={profileData.allergies} onChange={e => setProfileData({...profileData, allergies: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Chronic Illnesses</label>
                  <input type="text" placeholder="e.g. asthma, none" value={profileData.chronic_illnesses} onChange={e => setProfileData({...profileData, chronic_illnesses: e.target.value})} />
                </div>

                {/* Part 3: Emergency Contacts */}
                <div style={{ gridColumn: '1 / -1', margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>❤️ Emergency Contact Details</h4>
                </div>
                <div className="form-group">
                  <label>Next of Kin Relationship</label>
                  <input type="text" placeholder="e.g. Spouse, Sibling, Parent" value={profileData.next_of_kin_relationship} onChange={e => setProfileData({...profileData, next_of_kin_relationship: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Next of Kin Name</label>
                  <input type="text" placeholder="Next of Kin's Full Name" value={profileData.next_of_kin_name} onChange={e => setProfileData({...profileData, next_of_kin_name: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Next of Kin Contact (Phone)</label>
                  <input type="tel" placeholder="Next of Kin's phone number" value={profileData.next_of_kin_phone} onChange={e => setProfileData({...profileData, next_of_kin_phone: e.target.value})} />
                </div>

              </div>
            </div>
            <button className="settings-btn-save" onClick={handleProfileSave}>
              Save Profile
            </button>
            
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Profile Picture">
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <img src={profileData.profile_image_preview} alt="Profile Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '10px' }} />
              </div>
            </Modal>
          </>
        );

      case 'appearance':
        return (
          <>
            <div className="settings-section-header">
              <h3>Appearance</h3>
              <p>Customize the look and feel of your SkillMatrix dashboard.</p>
            </div>
            
            <div className="setting-group" style={{ alignItems: 'flex-start' }}>
              <div className="setting-info">
                <h4>System Theme</h4>
                <p>Choose between the default dark glassmorphic theme or a bright high-contrast light theme.</p>
              </div>
              <div className="theme-options">
                <div 
                  className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    setTheme('dark');
                    localStorage.setItem('theme', 'dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }}
                >
                  <div className="theme-preview-dark"></div>
                  <span style={{ color: theme === 'dark' ? 'var(--accent-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                    <Moon size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} /> 
                    Dark Mode
                  </span>
                </div>
                <div 
                  className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    setTheme('light');
                    localStorage.setItem('theme', 'light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }}
                >
                  <div className="theme-preview-light"></div>
                  <span style={{ color: theme === 'light' ? 'var(--accent-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                    <Sun size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} /> 
                    Light Mode
                  </span>
                </div>
              </div>
            </div>
            <button className="settings-btn-save" onClick={handleSave}>Save Preferences</button>
          </>
        );
        
      case 'competency':
        return (
          <>
            <div className="settings-section-header">
              <h3>Competency System</h3>
              <p>Configure how employee skills and evaluations are managed.</p>
            </div>
            
            <div className="setting-group">
              <div className="setting-info">
                <h4>Strict Assessment Scaling</h4>
                <p>Enforce a strict 1-100 percentage scale for all assessments rather than custom scoring tiers.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-group">
              <div className="setting-info">
                <h4>Auto-archive Expired Certifications</h4>
                <p>Automatically move certifications to historical records once their validity period ends.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-group">
              <div className="setting-info">
                <h4>Skill Gap Tolerance</h4>
                <p>Highlight departments where average competency scores fall below a standard threshold.</p>
              </div>
              <select style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                <option>Threshold &lt; 70%</option>
                <option>Threshold &lt; 80%</option>
                <option>Threshold &lt; 90%</option>
              </select>
            </div>
            <button className="settings-btn-save" onClick={handleSave}>Apply Configuration</button>
          </>
        );

      case 'notifications':
        return (
          <>
            <div className="settings-section-header">
              <h3>Notifications</h3>
              <p>Manage how and when the system alerts you to workforce changes.</p>
            </div>
            
            <div className="setting-group">
              <div className="setting-info">
                <h4>Critical System Alerts</h4>
                <p>Receive immediate emails when system integrations or data syncs fail.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.emailAlerts} onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-group">
              <div className="setting-info">
                <h4>Assessment Reminders</h4>
                <p>Automatically notify managers when scheduled employee assessments are due.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications.assessmentReminders} onChange={() => setNotifications({...notifications, assessmentReminders: !notifications.assessmentReminders})} />
                <span className="slider"></span>
              </label>
            </div>
            <button className="settings-btn-save" onClick={handleSave}>Update Notifications</button>
          </>
        );

      case 'privacy':
        return (
          <>
            <div className="settings-section-header">
              <h3>Security & Privacy</h3>
              <p>Manage data sharing, user access controls, and system security.</p>
            </div>
            
            <div className="setting-group">
              <div className="setting-info">
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Require all administrative users to use 2FA when logging into the system.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-group">
              <div className="setting-info">
                <h4>Anonymize Reporting Data</h4>
                <p>Hide personally identifiable information (PII) when exporting system-wide performance reports.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-group">
              <div className="setting-info">
                <h4>Session Timeout</h4>
                <p>Automatically log users out after a period of inactivity.</p>
              </div>
              <select style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>Never</option>
              </select>
            </div>
            
            <button className="settings-btn-save" onClick={handleSave}>Save Security Settings</button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>{isManagerOrAdmin ? 'System Settings' : 'My Settings'}</h2>
          <span className="employee-count">{isManagerOrAdmin ? 'Admin Controls' : 'Personal Preferences'}</span>
        </div>
      </div>
      
      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <SettingsIcon size={18} /> My Profile
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Moon size={18} /> Appearance
          </button>
          
          {isManagerOrAdmin && (
            <>
              <button 
                className={`settings-nav-btn ${activeTab === 'competency' ? 'active' : ''}`}
                onClick={() => setActiveTab('competency')}
              >
                <Sliders size={18} /> Competency Rules
              </button>
              <button 
                className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} /> Notifications
              </button>
              <button 
                className={`settings-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <Shield size={18} /> Security & Privacy
              </button>
            </>
          )}
        </div>
        
        <div className="settings-content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
