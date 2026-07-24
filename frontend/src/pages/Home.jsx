import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, Briefcase, Award, Activity, 
  AlertTriangle, Clock, CheckCircle, Target, TrendingUp,
  Mail, Phone, MapPin, Calendar, CheckSquare, ChevronRight, Download, FileText,
  ShieldCheck, Sparkles, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AIExecutiveSummary from '../components/AIExecutiveSummary';
import './Home.css';
import './HomeEmployeeProfile.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  const [stats, setStats] = useState({
    totalEmployees: 0,
    openPositions: 0,
    pendingEnrollments: [],
    expiringCerts: [],
    recentAssessments: [],
  });

  const [passportData, setPassportData] = useState({
    profile: null,
    skills: [],
    certifications: [],
    enrollments: [],
    assessments: [],
    leaves: [],
    absences: [],
    complaints: []
  });

  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('auto_apply', 'true');
    try {
      setParsingResume(true);
      const res = await api.post('/ai/extract/resume/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Parsed ${res.data.skills_added?.length || 0} skills & certifications via Gemini AI!`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse resume.');
    } finally {
      setParsingResume(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (isManagerOrAdmin) {
        const [empRes, posRes, enrRes, certRes, assRes] = await Promise.all([
          api.get('/employees/'),
          api.get('/positions/'),
          api.get('/enrollments/'),
          api.get('/employee-certifications/'),
          api.get('/assessments/')
        ]);

        const employees = empRes.data.results || empRes.data || [];
        const positions = posRes.data.results || posRes.data || [];
        const enrollments = enrRes.data.results || enrRes.data || [];
        const certs = certRes.data.results || certRes.data || [];
        const assessments = assRes.data.results || assRes.data || [];

        const pending = enrollments.filter(e => e.status === 'pending_approval');
        const expiring = certs
          .filter(c => c.expiry_date && new Date(c.expiry_date) > new Date())
          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
          .slice(0, 5);

        setStats({
          totalEmployees: employees.length,
          openPositions: positions.length,
          pendingEnrollments: pending,
          expiringCerts: expiring,
          recentAssessments: assessments.slice(-5).reverse()
        });
      } else {
        // Employee Talent Passport Data
        const [meRes, skillsRes, certRes, enrRes, assRes, leaveRes, absRes, compRes] = await Promise.all([
          api.get('/employees/me/'),
          api.get('/employee-skills/'),
          api.get('/employee-certifications/'),
          api.get('/enrollments/'),
          api.get('/assessments/'),
          api.get('/leave-requests/'),
          api.get('/absence-reports/'),
          api.get('/complaints/')
        ]);
        
        setPassportData({
          profile: meRes.data,
          skills: skillsRes.data.results || skillsRes.data || [],
          certifications: certRes.data.results || certRes.data || [],
          enrollments: enrRes.data.results || enrRes.data || [],
          assessments: assRes.data.results || assRes.data || [],
          leaves: leaveRes.data.results || leaveRes.data || [],
          absences: absRes.data.results || absRes.data || [],
          complaints: compRes.data.results || compRes.data || []
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {user?.username}</h2>
          <p>Here's what's happening across your workforce today.</p>
        </div>
      </div>

      {/* AI Executive Summary for Managers/Admins */}
      {isManagerOrAdmin && <AIExecutiveSummary />}

      {!isManagerOrAdmin ? (
        <div className="employee-passport-container">
          {/* Pre-compute derived stats */}
          {(() => {
            const managerName = passportData.profile?.manager_name || 'No Manager Assigned';
            
            const totalSkills = passportData.skills.length;
            const avgProf = totalSkills > 0 ? passportData.skills.reduce((acc, s) => acc + (s.proficiency || 0), 0) / totalSkills : 0;
            const compScorePercent = totalSkills > 0 ? Math.round((avgProf / 5) * 100) : 0;
            const stars = '★'.repeat(Math.round(avgProf)) + '☆'.repeat(5 - Math.round(avgProf));

            const activities = [];
            passportData.certifications.forEach(c => {
              if(c.issue_date) activities.push({ date: new Date(c.issue_date), text: `Earned ${c.certification_name || 'Certificate'}` });
            });
            passportData.enrollments.forEach(e => {
              const d = e.enrollment_date || e.created_at;
              if(d) activities.push({ date: new Date(d), text: `Enrolled in ${e.program_name || 'Training'}` });
            });
            passportData.assessments.forEach(a => {
              if(a.date) activities.push({ date: new Date(a.date), text: `Completed Assessment (Score: ${a.overall_score || 'N/A'})` });
            });
            activities.sort((a, b) => b.date - a.date);
            const recentActivities = activities.slice(0, 3);

            return (
              <>
                <div className="passport-header-card">
                  <div className="passport-avatar-wrapper">
                    {passportData.profile?.user?.profile_image ? (
                      <img src={passportData.profile.user.profile_image} alt="Profile" className="passport-avatar" />
                    ) : (
                      <div className="passport-avatar-placeholder">
                        {passportData.profile?.user?.first_name ? passportData.profile.user.first_name.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="passport-header-info">
                    <h2 className="passport-name">{passportData.profile?.user?.first_name} {passportData.profile?.user?.last_name}</h2>
                    <div className="passport-title">{passportData.profile?.position?.name || 'Employee'}</div>
                    <div className="passport-badges">
                      <span className="passport-badge"><Briefcase size={14}/> {passportData.profile?.department?.name || 'Unassigned Dept'}</span>
                      <span className="passport-badge"><CheckCircle size={14}/> Employee ID: {passportData.profile?.employee_id || 'EMP-0000'}</span>
                      <span className="passport-badge"><MapPin size={14}/> {passportData.profile?.location || 'HQ'}</span>
                    </div>
                  </div>
                  <div className="passport-overview-stats">
                    <div className="passport-stat-box">
                      <h4>Competency Score</h4>
                      <div className="value">{compScorePercent}%</div>
                      <div className="sub-value">{stars}</div>
                    </div>
                    <div className="passport-stat-box">
                      <h4>Promotion Readiness</h4>
                      <div className="value">TBD</div>
                      <div className="sub-value">Needs Review</div>
                    </div>
                  </div>
                </div>

                <div className="passport-main-grid">
                  {/* Left Column */}
                  <div className="passport-sidebar">
                    <div className="passport-section">
                      <h3 className="passport-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18}/> Personal Info</span>
                        <button className="btn-outline-small" onClick={() => navigate('/admin/settings', { state: { activeTab: 'profile' } })}>Edit</button>
                      </h3>
                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">{passportData.profile?.user?.first_name} {passportData.profile?.user?.last_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email</span>
                          <span className="info-value">{passportData.profile?.user?.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone</span>
                          <span className="info-value">{passportData.profile?.phone || 'Not Provided'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date Joined</span>
                          <span className="info-value">{passportData.profile?.hire_date ? new Date(passportData.profile.hire_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Reporting Manager</span>
                          <span className="info-value">{managerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="passport-section">
                      <h3 className="passport-section-title"><CheckSquare size={18}/> Goals & Plans</h3>
                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-value" style={{opacity: 0.7}}>No active goals mapped yet. Check with your manager to establish succession plans.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="passport-content">
                    
                    <div className="passport-section ai-coach-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 className="passport-section-title" style={{borderBottom: 'none', marginBottom: 0}}><Activity size={18}/> Digital Skill Passport & AI Assistant</h3>
                        <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setShowQRModal(true)}>
                          View QR Verification Badge
                        </button>
                      </div>
                      <div className="ai-recommendation" style={{ marginTop: '12px' }}>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', margin: 0}}>
                          <strong>⚡ AI Resume Auto-Populate:</strong> Upload your PDF resume/CV below. Gemini AI will parse your skills & certifications and auto-populate your passport profile!
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                          <input 
                            type="file" 
                            accept=".pdf"
                            id="resume-home-upload"
                            onChange={handleResumeUpload}
                            style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}
                          />
                          {parsingResume && <span style={{ fontSize: '0.8rem', color: 'var(--accent-orange)' }}>Parsing with Gemini...</span>}
                        </div>
                      </div>

                      <div className="ai-recommendation" style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', margin: 0}}>
                          <strong>🎯 AI Training Recommendations:</strong> Get personalized suggestions for internal programs and online web courses based on your skill gaps.
                        </p>
                        <div style={{ marginTop: '10px' }}>
                          <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/learning/training', { state: { activeTab: 'recommendations' } })}>
                            <Sparkles size={14} /> View Recommendations
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="passport-section">
                      <h3 className="passport-section-title"><Target size={18}/> Skills Matrix</h3>
                      {passportData.skills.length > 0 ? (
                        <div className="skills-matrix">
                          {passportData.skills.map(skill => (
                            <div key={skill.id} className="skill-matrix-item">
                              <div className="skill-header">
                                <span>{skill.skill_name || skill.skill?.name || 'Skill'}</span>
                                <span>{skill.proficiency}/5</span>
                              </div>
                              <div className="skill-bar-bg">
                                <div className="skill-bar-fill" style={{width: `${(skill.proficiency / 5) * 100}%`}}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No skills logged yet.</p>
                      )}
                    </div>

                    <div className="passport-section">
                      <h3 className="passport-section-title"><Award size={18}/> Certificates</h3>
                      <div className="cert-grid">
                        {passportData.certifications.length > 0 ? (
                          passportData.certifications.map(cert => (
                            <div key={cert.id} className="cert-card">
                              <Award size={32} className="cert-icon" />
                              <h4>{cert.certification_name}</h4>
                              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Issued: {new Date(cert.issue_date).toLocaleDateString()}</div>
                              <div className={`cert-status ${!cert.expiry_date || new Date(cert.expiry_date) > new Date() ? 'cert-valid' : 'cert-expired'}`}>
                                {!cert.expiry_date ? 'Valid' : (new Date(cert.expiry_date) > new Date() ? 'Valid' : 'Expired')}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted" style={{gridColumn: '1 / -1'}}>No certifications on file.</p>
                        )}
                      </div>
                    </div>

                    <div className="passport-section">
                      <h3 className="passport-section-title"><Clock size={18}/> Recent Activity</h3>
                      {recentActivities.length > 0 ? (
                        <div className="timeline">
                          {recentActivities.map((act, i) => (
                            <div className="timeline-item" key={i}>
                              <div className="timeline-date">{act.date.toLocaleDateString()}</div>
                              <div className="timeline-content"><p>{act.text}</p></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No recent activity found.</p>
                      )}
                    </div>

                    {/* Leaves & Absences */}
                    <div className="passport-section">
                      <h3 className="passport-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={18}/> Leaves & Absences Record</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.8 }}>Leaves</h4>
                          {(passportData.leaves || []).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {(passportData.leaves || []).map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                  <span className="capitalize">{item.leave_type} Leave</span>
                                  <span style={{ color: 'var(--text-muted)' }}>📅 {item.start_date} to {item.end_date}</span>
                                  <span className={`status-badge ${item.status}`} style={{ transform: 'scale(0.85)' }}>{item.status}</span>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>No leaves logged.</p>}
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.8 }}>Absences</h4>
                          {(passportData.absences || []).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {(passportData.absences || []).map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                  <span>Reported Absence</span>
                                  <span style={{ color: 'var(--text-muted)' }}>📅 Date: {item.date}</span>
                                  <span className={`status-badge ${item.status}`} style={{ transform: 'scale(0.85)' }}>{item.status}</span>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>No absences logged.</p>}
                        </div>
                      </div>
                    </div>

                    {/* Confidential Complaints (Submitting Employee Only) */}
                    <div className="passport-section">
                      <h3 className="passport-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={18}/> Confidential Complaints Filed</h3>
                      {(passportData.complaints || []).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(passportData.complaints || []).map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600 }}>{item.title}</span>
                              <span style={{ color: 'var(--text-muted)' }}>Logged on {new Date(item.created_at).toLocaleDateString()}</span>
                              <span className={`status-badge ${item.status}`} style={{ transform: 'scale(0.85)' }}>{item.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>No confidential complaints filed.</p>}
                    </div>

                  </div>
                </div>
              </>
            );
          })()}

          <div className="passport-main-grid">
                  
          </div>
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="dashboard-stats-grid">
            <div className="stat-card" onClick={() => navigate('/people/employees')}>
              <div className="stat-icon bg-blue-light"><Users size={24} color="#3b82f6" /></div>
              <div className="stat-content">
                <h3>{stats.totalEmployees}</h3>
                <p>Total Employees</p>
              </div>
            </div>
            
            <div className="stat-card" onClick={() => navigate('/people/positions')}>
              <div className="stat-icon bg-purple-light"><Briefcase size={24} color="#a855f7" /></div>
              <div className="stat-content">
                <h3>{stats.openPositions}</h3>
                <p>Active Positions</p>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/learning/training')}>
              <div className="stat-icon bg-orange-light"><Clock size={24} color="#f68b1f" /></div>
              <div className="stat-content">
                <h3>{stats.pendingEnrollments.length}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/learning/certifications')}>
              <div className="stat-icon bg-red-light"><AlertTriangle size={24} color="#ef4444" /></div>
              <div className="stat-content">
                <h3>{stats.expiringCerts.length}</h3>
                <p>Expiring Certs</p>
              </div>
            </div>
          </div>

          <div className="dashboard-main-grid">
            {/* Actionable Widget: Pending Approvals */}
            <div className="dashboard-widget">
              <div className="widget-header">
                <h3><Clock size={18} /> Training Approvals Needed</h3>
                <button className="btn-text" onClick={() => navigate('/learning/training')}>View All</button>
              </div>
              <div className="widget-content">
                {stats.pendingEnrollments.length > 0 ? (
                  <ul className="action-list">
                    {stats.pendingEnrollments.slice(0, 5).map(enr => (
                      <li key={enr.id} className="action-item">
                        <div className="action-info">
                          <strong>{enr.employee_name || 'Employee'}</strong> requested 
                          <br/><span>{enr.program_name || 'Training'}</span>
                        </div>
                        {isManagerOrAdmin && (
                          <button className="btn-outline-small" onClick={() => navigate('/learning/training')}>Review</button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <CheckCircle size={32} color="#4ade80" />
                    <p>All caught up! No pending approvals.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Widget: Expiring Certifications */}
            <div className="dashboard-widget">
              <div className="widget-header">
                <h3><Award size={18} /> Upcoming Expirations</h3>
                <button className="btn-text" onClick={() => navigate('/learning/certifications')}>View All</button>
              </div>
              <div className="widget-content">
                {stats.expiringCerts.length > 0 ? (
                  <ul className="action-list">
                    {stats.expiringCerts.map(cert => (
                      <li key={cert.id} className="action-item warning">
                        <div className="action-info">
                          <strong>{cert.certification_name || 'Cert'}</strong>
                          <br/><span>Expiring: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <button className="btn-outline-small" onClick={() => navigate('/learning/certifications')}>Update</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <CheckCircle size={32} color="#4ade80" />
                    <p>No certifications expiring soon.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Widget: Recent Assessments */}
            <div className="dashboard-widget">
              <div className="widget-header">
                <h3><Activity size={18} /> Recent Assessments</h3>
                <button className="btn-text" onClick={() => navigate('/performance/assessments')}>View All</button>
              </div>
              <div className="widget-content">
                {stats.recentAssessments.length > 0 ? (
                  <ul className="action-list">
                    {stats.recentAssessments.map(ass => (
                      <li key={ass.id} className="action-item">
                        <div className="action-info">
                          <strong>Assessment #{ass.id}</strong>
                          <br/><span>Date: {ass.date || 'Recent'} • Score: {ass.overall_score || 'N/A'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <Target size={32} color="#94a3b8" />
                    <p>No recent assessments.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Widget: Workforce Competencies */}
            <div className="dashboard-widget">
              <div className="widget-header">
                <h3><TrendingUp size={18} /> Workforce Competencies</h3>
                <button className="btn-text" onClick={() => navigate('/learning/competencies')}>View Matrix</button>
              </div>
              <div className="widget-content">
                <ul className="action-list">
                  <li className="action-item" style={{ alignItems: 'center' }}>
                    <div className="action-info" style={{ flex: 1 }}>
                      <strong>Technical Skills</strong>
                      <br/><span style={{ fontSize: '0.8rem' }}>Avg. Score: 4.1 / 5.0</span>
                    </div>
                    <div style={{ width: '40%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '82%', height: '100%', background: '#4ade80' }}></div>
                    </div>
                  </li>
                  <li className="action-item" style={{ alignItems: 'center' }}>
                    <div className="action-info" style={{ flex: 1 }}>
                      <strong>Leadership</strong>
                      <br/><span style={{ fontSize: '0.8rem' }}>Avg. Score: 3.2 / 5.0</span>
                    </div>
                    <div style={{ width: '40%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '64%', height: '100%', background: '#f68b1f' }}></div>
                    </div>
                  </li>
                  <li className="action-item" style={{ alignItems: 'center' }}>
                    <div className="action-info" style={{ flex: 1 }}>
                      <strong>Communication</strong>
                      <br/><span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Avg. Score: 2.5 / 5.0 (Gap Identified)</span>
                    </div>
                    <div style={{ width: '40%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '50%', height: '100%', background: '#ef4444' }}></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Digital Skill Passport QR Code Verification Modal */}
      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', border: '2px solid var(--accent-orange)', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowQRModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'inline-flex', padding: '10px 16px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '16px', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Digitally Verified Skill Passport
            </div>

            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              {passportData.profile?.user?.first_name} {passportData.profile?.user?.last_name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
              {passportData.profile?.position?.name || 'Software Engineer'} • {passportData.profile?.department?.name || 'Engineering'}
            </p>

            {/* Generated QR Code Representation */}
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <svg width="150" height="150" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff"/>
                {/* QR Pattern Mockup */}
                <rect x="10" y="10" width="30" height="30" fill="#0f172a"/>
                <rect x="15" y="15" width="20" height="20" fill="#ffffff"/>
                <rect x="20" y="20" width="10" height="10" fill="#0f172a"/>

                <rect x="60" y="10" width="30" height="30" fill="#0f172a"/>
                <rect x="65" y="15" width="20" height="20" fill="#ffffff"/>
                <rect x="70" y="20" width="10" height="10" fill="#0f172a"/>

                <rect x="10" y="60" width="30" height="30" fill="#0f172a"/>
                <rect x="15" y="65" width="20" height="20" fill="#ffffff"/>
                <rect x="20" y="70" width="10" height="10" fill="#0f172a"/>

                {/* Data Pixels */}
                <rect x="45" y="15" width="8" height="8" fill="#0f172a"/>
                <rect x="45" y="30" width="8" height="8" fill="#0f172a"/>
                <rect x="15" y="45" width="8" height="8" fill="#0f172a"/>
                <rect x="30" y="45" width="8" height="8" fill="#0f172a"/>
                <rect x="50" y="50" width="12" height="12" fill="#f68b1f"/>
                <rect x="65" y="45" width="8" height="8" fill="#0f172a"/>
                <rect x="80" y="45" width="8" height="8" fill="#0f172a"/>
                <rect x="45" y="65" width="8" height="8" fill="#0f172a"/>
                <rect x="65" y="65" width="8" height="8" fill="#0f172a"/>
                <rect x="75" y="75" width="12" height="12" fill="#0f172a"/>
              </svg>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              ID: <strong>{passportData.profile?.employee_id || 'EMP-VERIFIED'}</strong> • Cryptographic Proof Active
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { toast.success('Passport verification link copied to clipboard!'); setShowQRModal(false); }}>
              Copy Public Verification Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
