import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Briefcase, CheckCircle, MapPin, Users, Activity, Target, Clock, Award, BrainCircuit, FileText } from 'lucide-react';
import api from '../api/axios';
import Skills from './Skills';
import Training from './Training';
import Certifications from './Certifications';
import AIGapAnalysis from '../components/AIGapAnalysis';
import AIPromotionReadiness from '../components/AIPromotionReadiness';
import Modal from '../components/Modal';
import AIAdvisorModal from '../components/AIAdvisorModal';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './HomeEmployeeProfile.css';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [skills, setSkills] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [saving, setSaving] = useState(false);

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  useEffect(() => {
    if (isEditing && departments.length === 0) {
      fetchDepartmentsAndPositions();
    }
  }, [isEditing]);

  const fetchDepartmentsAndPositions = async () => {
    try {
      const [depRes, posRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/positions/')
      ]);
      setDepartments(depRes.data.results || depRes.data || []);
      setPositions(posRes.data.results || posRes.data || []);
    } catch (err) {
      console.error("Failed to fetch departments/positions", err);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const [empRes, skillsRes] = await Promise.all([
        api.get(`/employees/${id}/`),
        api.get(`/employee-skills/?employee=${id}`)
      ]);
      setEmployee(empRes.data);
      setSkills(skillsRes.data.results || skillsRes.data || []);

      // Fetch HR logs safely
      try {
        const leaveRes = await api.get(`/leave-requests/?employee=${id}`);
        setLeaves(leaveRes.data.results || leaveRes.data || []);
      } catch (e) { console.error(e); }

      try {
        const absRes = await api.get(`/absence-reports/?employee=${id}`);
        setAbsences(absRes.data.results || absRes.data || []);
      } catch (e) { console.error(e); }

      const isHRorAdmin = user?.role === 'admin' || user?.role === 'hr';
      if (isHRorAdmin) {
        try {
          const compRes = await api.get(`/complaints/?employee=${id}`);
          setComplaints(compRes.data.results || compRes.data || []);
        } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error("Failed to load employee details", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      first_name: employee.user?.first_name || '',
      last_name: employee.user?.last_name || '',
      email: employee.user?.email || '',
      phone: employee.phone || '',
      role: employee.user?.role || 'employee',
      department: employee.department?.id || '',
      position: employee.position?.id || '',
      blood_group: employee.blood_group || '',
      allergies: employee.allergies || '',
      chronic_illnesses: employee.chronic_illnesses || '',
      next_of_kin_relationship: employee.next_of_kin_relationship || '',
      next_of_kin_name: employee.next_of_kin_name || '',
      next_of_kin_phone: employee.next_of_kin_phone || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await api.patch(`/employees/${id}/`, editData);
      toast.success('Employee updated successfully');
      setIsEditing(false);
      fetchEmployeeDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading employee profile...</div>;
  if (!employee) return <div className="error-state">Employee not found.</div>;

  // Pre-compute competency stats
  const totalSkills = skills.length;
  const avgProf = totalSkills > 0 ? skills.reduce((acc, s) => acc + (s.proficiency || 0), 0) / totalSkills : 0;
  const competencyScore = totalSkills > 0 ? Math.round((avgProf / 5) * 100) : 0;
  const stars = '★'.repeat(Math.round(avgProf)) + '☆'.repeat(5 - Math.round(avgProf));

  return (
    <div className="detail-page-container employee-passport-container">
      <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate('/people/employees')}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(isManagerOrAdmin || user?.id === employee?.user?.id) && (
            <button className="btn-primary-small" onClick={() => setIsAdvisorOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-orange)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              <BrainCircuit size={14} /> AI Career Advisor
            </button>
          )}
          {isManagerOrAdmin && (
            <button className="btn-outline-small" onClick={openEditModal} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Edit size={14} /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Passport Header Card */}
      <div className="passport-header-card">
        <div className="passport-avatar-wrapper">
          {employee.user?.profile_image ? (
            <img src={employee.user.profile_image} alt="Profile" className="passport-avatar" />
          ) : (
            <div className="passport-avatar-placeholder">
              {employee.user?.first_name ? employee.user.first_name.charAt(0).toUpperCase() : employee.user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="passport-header-info">
          <h2 className="passport-name">{employee.user?.first_name} {employee.user?.last_name}</h2>
          <div className="passport-title">{employee.job_title || employee.position?.name || 'N/A'}</div>
          <div className="passport-badges">
            <span className="passport-badge"><Briefcase size={14}/> {employee.department?.name || 'Unassigned Dept'}</span>
            <span className="passport-badge"><CheckCircle size={14}/> Employee ID: {employee.employee_id}</span>
            <span className="passport-badge"><MapPin size={14}/> {employee.location || 'HQ'}</span>
          </div>
        </div>
        <div className="passport-overview-stats">
          <div className="passport-stat-box">
            <h4>Competency Score</h4>
            <div className="value">{competencyScore}%</div>
            <div className="sub-value">{stars}</div>
          </div>
          <div className="passport-stat-box">
            <h4>Promotion Readiness</h4>
            <div className="value">TBD</div>
            <div className="sub-value">Needs Review</div>
          </div>
        </div>
      </div>

      {/* Passport Main Grid */}
      <div className="passport-main-grid">
        {/* Left Column: Sidebar */}
        <div className="passport-sidebar">
          <div className="passport-section">
            <h3 className="passport-section-title"><Users size={18}/> Personal Info</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{employee.user?.first_name} {employee.user?.last_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{employee.user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{employee.phone || 'Not Provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date Joined</span>
                <span className="info-value">{employee.hire_date || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">System Role</span>
                <span className="info-value capitalize">{employee.user?.role}</span>
              </div>
            </div>
          </div>

          <div className="passport-section" style={{ marginTop: '20px' }}>
            <h3 className="passport-section-title">🩺 Bio Data & Emergency Contacts</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Blood Group</span>
                <span className="info-value">{employee.blood_group || 'Not Provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Allergies</span>
                <span className="info-value">{employee.allergies || 'None'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chronic Illnesses</span>
                <span className="info-value">{employee.chronic_illnesses || 'None'}</span>
              </div>
              <div style={{ margin: '15px 0 10px 0', borderBottom: '1px dashed var(--border-light)' }}></div>
              <div className="info-item">
                <span className="info-label">Next of Kin Name</span>
                <span className="info-value">{employee.next_of_kin_name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Relationship</span>
                <span className="info-value">{employee.next_of_kin_relationship || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Next of Kin Contact</span>
                <span className="info-value">{employee.next_of_kin_phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="passport-content">
          {/* AI Gap Analysis & Promotion Readiness */}
          <div className="passport-section ai-coach-card">
            <h3 className="passport-section-title"><Activity size={18}/> AI Competency & Performance Insights</h3>
            <AIPromotionReadiness employeeId={employee.id} />
            <AIGapAnalysis employeeId={employee.id} />
          </div>

          {/* Skills Matrix */}
          <div className="passport-section">
            <h3 className="passport-section-title"><Target size={18}/> Skills Matrix</h3>
            <Skills employeeId={employee.id} />
          </div>

          {/* Training */}
          <div className="passport-section">
            <h3 className="passport-section-title"><Clock size={18}/> Training Programs</h3>
            <Training employeeId={employee.id} />
          </div>

          {/* Certifications */}
          <div className="passport-section">
            <h3 className="passport-section-title"><Award size={18}/> Certifications</h3>
            <Certifications employeeId={employee.id} />
          </div>

          {/* Leaves & Absences History */}
          <div className="passport-section">
            <h3 className="passport-section-title"><ArrowLeft size={18} style={{ transform: 'rotate(-90deg)' }}/> Leaves & Absences History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.8 }}>Leaves</h4>
                {leaves.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {leaves.map(item => (
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
                {absences.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {absences.map(item => (
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

          {/* Confidential Complaints (Visible strictly to HR/Admin) */}
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <div className="passport-section">
              <h3 className="passport-section-title"><FileText size={18}/> Confidential Complaints (Admin Only)</h3>
              {complaints.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {complaints.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Logged on {new Date(item.created_at).toLocaleDateString()}</span>
                      <span className={`status-badge ${item.status}`} style={{ transform: 'scale(0.85)' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted" style={{ fontSize: '0.85rem' }}>No complaints filed.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Employee Details">
        <div className="employee-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              value={editData.first_name || ''} 
              onChange={e => setEditData({...editData, first_name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              value={editData.last_name || ''} 
              onChange={e => setEditData({...editData, last_name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={editData.email || ''} 
              onChange={e => setEditData({...editData, email: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              value={editData.phone || ''} 
              onChange={e => setEditData({...editData, phone: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select 
              value={editData.department || ''} 
              onChange={e => setEditData({...editData, department: e.target.value})}
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Job Title (Position)</label>
            <select 
              value={editData.position || ''} 
              onChange={e => setEditData({...editData, position: e.target.value})}
            >
              <option value="">Select Position</option>
              {positions.filter(p => !editData.department || p.department === parseInt(editData.department)).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>System Role</label>
            <select 
              value={editData.role || 'employee'} 
              onChange={e => setEditData({...editData, role: e.target.value})}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', margin: '15px 0 5px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '5px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Medical Bio Data</strong>
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <input type="text" value={editData.blood_group || ''} onChange={e => setEditData({...editData, blood_group: e.target.value})} placeholder="e.g. B+" />
          </div>
          <div className="form-group">
            <label>Allergies</label>
            <input type="text" value={editData.allergies || ''} onChange={e => setEditData({...editData, allergies: e.target.value})} placeholder="e.g. dust" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Chronic Illnesses</label>
            <input type="text" value={editData.chronic_illnesses || ''} onChange={e => setEditData({...editData, chronic_illnesses: e.target.value})} placeholder="e.g. none" />
          </div>

          <div style={{ gridColumn: '1 / -1', margin: '15px 0 5px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '5px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Next of Kin Details</strong>
          </div>
          <div className="form-group">
            <label>Next of Kin Relationship</label>
            <input type="text" value={editData.next_of_kin_relationship || ''} onChange={e => setEditData({...editData, next_of_kin_relationship: e.target.value})} placeholder="e.g. Spouse, Sibling" />
          </div>
          <div className="form-group">
            <label>Next of Kin Name</label>
            <input type="text" value={editData.next_of_kin_name || ''} onChange={e => setEditData({...editData, next_of_kin_name: e.target.value})} placeholder="Next of Kin Name" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Next of Kin Contact Phone</label>
            <input type="text" value={editData.next_of_kin_phone || ''} onChange={e => setEditData({...editData, next_of_kin_phone: e.target.value})} placeholder="Next of Kin phone number" />
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-outline-small" onClick={() => setIsEditing(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <AIAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        employeeId={employee.id}
        employeeName={`${employee.user?.first_name} ${employee.user?.last_name}`}
      />

    </div>
  );
};

export default EmployeeDetail;
