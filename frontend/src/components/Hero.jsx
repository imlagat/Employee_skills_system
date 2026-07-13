import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import { ChevronDown, BarChart2, Activity, Database } from 'lucide-react';
import api from '../api/axios';

const Hero = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    employees: [],
    departments: 0,
    skills: 0,
    certifications: 0,
    assessments: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, deptRes, skillRes, certRes, assRes] = await Promise.all([
          api.get('/employees/'),
          api.get('/departments/'),
          api.get('/skills/'),
          api.get('/certifications/'),
          api.get('/assessments/')
        ]);

        const extractArray = (res) => {
          if (res?.data?.results && Array.isArray(res.data.results)) return res.data.results;
          if (Array.isArray(res?.data)) return res.data;
          return [];
        };

        setStats({
          employees: extractArray(empRes),
          departments: extractArray(deptRes).length,
          skills: extractArray(skillRes).length,
          certifications: extractArray(certRes).length,
          assessments: extractArray(assRes).length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  const totalEmployees = stats.employees.length;
  const recentEmployees = stats.employees.slice(-5).reverse(); // Get latest 5
  const avatarColors = ['bg-teal', 'bg-pink', 'bg-yellow', 'bg-purple'];

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="top-badge">
          <span className="badge-text">Live System Data</span>
          <span className="badge-stars">★★★★★</span>
          <span className="badge-score">Online</span>
          <span className="badge-google"><span style={{color:'#4285F4'}}>G</span> Secure Network</span>
        </div>
        
        <h1>Employee Skills Management System</h1>
        <p>Track competencies, manage certifications, and monitor organizational<br/>capability gaps with real-time analytics.</p>
      </div>

      <div className="hero-dashboard-preview">
        
        {/* Floating Top Right Widget */}
        <div className="glass-card snapshot-widget">
          <div className="snapshot-header">Team Snapshot</div>
          <div className="avatars-row">
            {recentEmployees.slice(0,4).map((emp, idx) => (
              <div key={emp.id} className={`avatar ${avatarColors[idx % 4]}`}>{getInitials((emp.user?.first_name || 'U') + ' ' + (emp.user?.last_name || 'N'))}</div>
            ))}
            {totalEmployees > 4 && <div className="avatar bg-gray">+{totalEmployees - 4}</div>}
          </div>
          <div className="snapshot-stats">
            <div>
              <h3>{totalEmployees}</h3>
              <p>Total Staff</p>
            </div>
            <div>
              <h3 className="text-teal">{stats.departments}</h3>
              <p>Departments</p>
            </div>
          </div>
          <div className="snapshot-footer">
            <span>📅 Active Records</span>
            <span className="badge-notification">Sync</span>
          </div>
        </div>

        <div className="cards-container">
          
          {/* Active Directory Card */}
          <div className="glass-card session-card">
            <div className="card-top-small">
              <div className="small-avatar bg-purple">DB</div>
              <div className="small-info">
                <strong>SkillMatrix DB</strong>
                <span>Real-time connected • API</span>
              </div>
              <div className="small-rating">
                <span>Secure ★★★★★</span>
                <div className="tags">
                  <span className="tag-purple">{stats.skills} core skills</span>
                </div>
              </div>
            </div>
            
            <div className="session-body">
              <div className="session-header">RECENTLY ADDED EMPLOYEES</div>
              <div className="session-list">
                {recentEmployees.length > 0 ? recentEmployees.map((emp, idx) => (
                  <div className="session-item" key={emp.id}>
                    <div className={`avatar ${avatarColors[idx % 4]}`}>
                      {getInitials((emp.user?.first_name || 'U') + ' ' + (emp.user?.last_name || 'N'))}
                    </div>
                    <div className="user-info">
                      <strong>{emp.user?.first_name || 'Unknown'} {emp.user?.last_name || 'User'}</strong>
                      <span>{emp.job_title || 'No Title'} • {emp.department?.name || 'Dept'}</span>
                    </div>
                    <div className="status-dot green"></div>
                  </div>
                )) : (
                  <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>No employees registered yet.</div>
                )}
              </div>
            </div>
          </div>
          
          {/* System Metrics Card */}
          <div className="glass-card hiring-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
                <Activity size={20} color="var(--accent-teal)" /> System Overview
              </div>
              <span className="tag-green">Live Metrics</span>
            </div>
            <div className="hiring-stats">
              <h2>{stats.skills + stats.certifications + stats.assessments}</h2>
              <div className="trend-up">▲ Total Data Points Tracked</div>
            </div>
            
            <div className="progress-list">
              <div className="progress-item">
                <span style={{width: '60px'}}>Skills</span>
                <div className="bar-bg"><div className="bar-fill" style={{width: `${Math.min(100, stats.skills * 5)}%`}}></div></div>
                <span>{stats.skills}</span>
              </div>
              <div className="progress-item">
                <span style={{width: '60px'}}>Certs</span>
                <div className="bar-bg"><div className="bar-fill" style={{width: `${Math.min(100, stats.certifications * 5)}%`}}></div></div>
                <span>{stats.certifications}</span>
              </div>
              <div className="progress-item">
                <span style={{width: '60px'}}>Assess</span>
                <div className="bar-bg"><div className="bar-fill" style={{width: `${Math.min(100, stats.assessments * 5)}%`}}></div></div>
                <span>{stats.assessments}</span>
              </div>
              <div className="progress-item">
                <span style={{width: '60px'}}>Depts</span>
                <div className="bar-bg"><div className="bar-fill" style={{width: `${Math.min(100, stats.departments * 10)}%`}}></div></div>
                <span>{stats.departments}</span>
              </div>
            </div>
            
            <div className="hiring-footer">
              <div className="footer-stat">
                <div className="dot teal"></div>
                <small>Workforce</small>
                <strong>{totalEmployees}</strong>
              </div>
              <div className="footer-stat">
                <div className="dot blue"></div>
                <small>Competencies</small>
                <strong>{stats.skills}</strong>
              </div>
              <div className="footer-stat">
                <div className="dot red"></div>
                <small>Evaluations</small>
                <strong>{stats.assessments}</strong>
              </div>
            </div>
          </div>
          
          {/* Assessment Summary Card */}
          <div className="right-cards-col">
            <div className="glass-card small-top-card">
              <div className="small-avatar bg-purple" style={{opacity: 0.8}}>HR</div>
              <div className="small-info">
                <strong>System Admin</strong>
                <span>Data Matrix <span className="tag-purple">Active</span></span>
              </div>
            </div>
            
            <div className="glass-card payroll-card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
                  <Database size={20} color="var(--accent-orange)" /> Records Summary
                </div>
              </div>
              <div className="payroll-stats">
                <h2>{stats.assessments}</h2>
                <p>Completed Assessments</p>
              </div>
              
              <div className="bar-chart-mock">
                <div className="bar-col">
                  <span className="bar-val">{stats.skills}</span>
                  <div className="bar green" style={{height: `${Math.max(30, Math.min(100, stats.skills * 10))}px`}}></div>
                  <span className="bar-label">Skills</span>
                </div>
                <div className="bar-col">
                  <span className="bar-val">{stats.certifications}</span>
                  <div className="bar yellow" style={{height: `${Math.max(30, Math.min(100, stats.certifications * 10))}px`}}></div>
                  <span className="bar-label">Certs</span>
                </div>
                <div className="bar-col">
                  <span className="bar-val">{stats.departments}</span>
                  <div className="bar purple" style={{height: `${Math.max(30, Math.min(100, stats.departments * 20))}px`}}></div>
                  <span className="bar-label">Depts</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;
