import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase } from 'lucide-react';
import api from '../api/axios';
import './EmployeeDetail.css'; // Reusing the same CSS for layout consistency
import './EmployeeDirectory.css';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDepartmentDetails();
  }, [id]);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);
      // Assuming backend has employees nested or we fetch them separately
      const res = await api.get(`/departments/${id}/`);
      setDepartment(res.data);
    } catch (err) {
      console.error("Failed to load department details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading department profile...</div>;
  if (!department) return <div className="error-state">Department not found.</div>;

  return (
    <div className="detail-page-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/people/departments')}>
          <ArrowLeft size={18} /> Back to Departments
        </button>
      </div>

      <div className="profile-panel">
        <div className="panel-header">
          <h3>Department Profile</h3>
        </div>
        <div className="panel-content">
          <div className="basic-info-layout">
            <div className="profile-avatar-large" style={{ borderRadius: '12px', background: 'var(--accent-orange)', color: '#111' }}>
              <Briefcase size={40} />
            </div>
            
            <div className="info-column">
              <div className="info-row">
                <div className="info-label">Name</div>
                <div className="info-value" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)' }}>{department.name}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Headcount</div>
                <div className="info-value">{department.employees?.length || 0} Employees</div>
              </div>
              <div className="info-row">
                <div className="info-label">Open Positions</div>
                <div className="info-value">{department.positions?.length || 0}</div>
              </div>
            </div>

            <div className="info-column">
              <div className="info-row">
                <div className="info-label">Description</div>
                <div className="info-value">{department.description || "No description provided."}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Avg Competency</div>
                <div className="info-value">85%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-panel">
        <div className="panel-header" style={{ paddingBottom: '0' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              style={{ padding: '10px 0', border: 'none', background: 'transparent', color: activeTab === 'overview' ? 'var(--accent-orange)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--accent-orange)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', fontSize: '0.95rem' }}
              onClick={() => setActiveTab('overview')}>Overview</button>
            <button 
              style={{ padding: '10px 0', border: 'none', background: 'transparent', color: activeTab === 'employees' ? 'var(--accent-orange)' : 'var(--text-muted)', borderBottom: activeTab === 'employees' ? '2px solid var(--accent-orange)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'employees' ? 'bold' : 'normal', fontSize: '0.95rem' }}
              onClick={() => setActiveTab('employees')}>Employees</button>
            <button 
              style={{ padding: '10px 0', border: 'none', background: 'transparent', color: activeTab === 'positions' ? 'var(--accent-orange)' : 'var(--text-muted)', borderBottom: activeTab === 'positions' ? '2px solid var(--accent-orange)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'positions' ? 'bold' : 'normal', fontSize: '0.95rem' }}
              onClick={() => setActiveTab('positions')}>Roles & Positions</button>
          </div>
        </div>
        <div className="panel-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h4 style={{ color: 'var(--text-main)', marginTop: '0' }}>About {department.name}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{department.description || "No description provided."}</p>
              </div>
            )}
            
            {activeTab === 'employees' && (
              department.employees && department.employees.length > 0 ? (
                <div className="directory-card-grid">
                  {department.employees.map(emp => (
                    <div 
                      className="directory-card" 
                      key={emp.id} 
                      onClick={() => navigate(`/people/employees/${emp.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-header-flex">
                        <div className="employee-card-profile" style={{ marginBottom: 0 }}>
                          <div className="employee-card-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {emp.user?.profile_image ? (
                              <img src={emp.user.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>{emp.user?.first_name?.[0] || ''}{emp.user?.last_name?.[0] || ''}</>
                            )}
                          </div>
                          <div className="employee-card-details">
                            <div className="name-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                              {emp.user?.first_name} {emp.user?.last_name}
                            </div>
                            <div className="email-text">{emp.user?.email}</div>
                          </div>
                        </div>
                        <span className="card-badge capitalize">{emp.user?.role || 'Employee'}</span>
                      </div>
                      
                      <div className="card-body" style={{ marginTop: '10px' }}>
                        <div className="detail-row" style={{ marginBottom: '8px' }}>
                          <strong>ID:</strong> {emp.employee_id}
                        </div>
                        <div className="detail-row" style={{ marginBottom: '8px' }}>
                          <strong>Title:</strong> {emp.position?.name || 'N/A'}
                        </div>
                        <div className="detail-row">
                          <strong>Status:</strong> <span style={{ color: emp.is_active ? '#4ade80' : '#f87171' }}>{emp.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ marginBottom: '10px', opacity: '0.5' }} />
                  <p>No employees currently assigned to this department.</p>
                </div>
              )
            )}

            {activeTab === 'positions' && (
              department.positions && department.positions.length > 0 ? (
                <div className="directory-card-grid">
                  {department.positions.map(pos => {
                    const count = department.employees?.filter(emp => emp.position?.id === pos.id).length || 0;
                    return (
                      <div 
                        className="directory-card" 
                        key={pos.id}
                        style={{ cursor: 'default' }}
                      >
                        <div className="card-header-flex">
                          <div className="card-title-group">
                            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{pos.name}</h3>
                          </div>
                          <span 
                            className="card-badge" 
                            style={{ 
                              background: count > 0 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                              color: count > 0 ? '#4ade80' : '#ef4444' 
                            }}
                          >
                            {count > 0 ? `${count} Assigned` : 'Vacant'}
                          </span>
                        </div>
                        
                        <div className="card-body" style={{ marginTop: '10px' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {pos.description || "No description provided for this position."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Briefcase size={32} style={{ marginBottom: '10px', opacity: '0.5' }} />
                  <p>No positions currently defined for this department.</p>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;
