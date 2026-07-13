import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Target, Users, BookOpen } from 'lucide-react';
import api from '../api/axios';
import './EmployeeDetail.css';

const PositionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPositionDetails();
  }, [id]);

  const fetchPositionDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/positions/${id}/`);
      setPosition(res.data);
    } catch (err) {
      console.error("Failed to load position details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading position details...</div>;
  if (!position) return <div className="error-state">Position not found.</div>;

  return (
    <div className="detail-page-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/people/positions')}>
          <ArrowLeft size={18} /> Back to Positions
        </button>
      </div>

      <div className="employee-profile-layout">
        {/* Left Sidebar Info */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-large" style={{ borderRadius: '12px', background: '#3b82f6' }}>
              <Target size={40} />
            </div>
            <h2 className="profile-name">{position.name}</h2>
            <p className="profile-dept">{position.department_name}</p>
            
            <div className="profile-contact-info">
              <div className="contact-item">
                <Target size={16} /> <span>{position.competencies?.length || 0} Required Competencies</span>
              </div>
              <div className="contact-item">
                <Users size={16} /> <span>{position.employees?.length || 0} Active Employees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="profile-main-content">
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`tab-btn ${activeTab === 'competencies' ? 'active' : ''}`} onClick={() => setActiveTab('competencies')}>Required Competencies</button>
            <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>Employees in Role</button>
            <button className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')}>Training Paths</button>
          </div>

          <div className="tab-content-area">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h3>About the Role</h3>
                <p className="bio-text">{position.description || "No description provided."}</p>
                
                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Department</span>
                    <span className="info-value">{position.department_name}</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'competencies' && (
              <div className="placeholder-tab">
                <Target size={32} />
                <p>Required Competencies list will be embedded here.</p>
              </div>
            )}

            {activeTab === 'employees' && (
              <div className="placeholder-tab">
                <Users size={32} />
                <p>Employees holding this position will be listed here.</p>
              </div>
            )}

            {activeTab === 'training' && (
              <div className="placeholder-tab">
                <BookOpen size={32} />
                <p>Recommended Training Paths for this role will be listed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDetail;
