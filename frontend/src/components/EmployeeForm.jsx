import React, { useState, useEffect } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import api from '../api/axios';
import './EmployeeForm.css';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    job_title: '',
    department: '',
    hire_date: '',
    role: 'employee'
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [isCertsLoading, setIsCertsLoading] = useState(false);

  useEffect(() => {
    // Fetch departments for dropdown
    api.get('departments/')
      .then(res => setDepartments(res.data.results || res.data))
      .catch(err => console.error("Failed to load departments", err));

    if (employee) {
      setFormData({
        username: employee.user?.username || '',
        first_name: employee.user?.first_name || '',
        last_name: employee.user?.last_name || '',
        email: employee.user?.email || '',
        employee_id: employee.employee_id || '',
        job_title: employee.job_title || '',
        department: employee.department?.id || '',
        hire_date: employee.hire_date || '',
        role: employee.user?.role || 'employee'
      });
      fetchCertifications(employee.id);
    }
  }, [employee]);

  const fetchCertifications = async (empId) => {
    setIsCertsLoading(true);
    try {
      const res = await api.get(`employee-certifications/?employee=${empId}`);
      setCertifications(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load certifications", err);
    } finally {
      setIsCertsLoading(false);
    }
  };

  const handleVerifyCert = async (certId) => {
    try {
      await api.post(`employee-certifications/${certId}/verify/`);
      fetchCertifications(employee.id);
    } catch (err) {
      console.error(err);
      setError("Failed to verify certification");
    }
  };

  const handleRejectCert = async (certId) => {
    try {
      await api.post(`employee-certifications/${certId}/reject/`, { reason: 'Rejected by admin' });
      fetchCertifications(employee.id);
    } catch (err) {
      console.error(err);
      setError("Failed to reject certification");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (employee) {
        // Update existing
        await api.patch(`employees/${employee.id}/`, formData);
      } else {
        // Create new
        await api.post('employees/', formData);
      }
      onSave();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        // Flatten all field-level errors into a readable string
        const messages = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setError(messages || 'An error occurred while saving.');
      } else {
        setError('An error occurred while saving.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!employee) return;
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await api.get(`employees/${employee.id}/analyze_skills/`);
      setAiAnalysis(res.data);
    } catch (err) {
      console.error("Failed to analyze skills", err);
      setError("AI Analysis failed. Please try again or check API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!employee} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Employee ID</label>
          <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Hire Date</label>
          <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {employee ? (
          <button type="button" className="settings-btn-save" style={{ background: 'var(--accent-orange)' }} onClick={handleAIAnalysis} disabled={isAiLoading}>
            {isAiLoading ? <Loader className="spin" size={16} style={{ marginRight: '5px' }} /> : <Sparkles size={16} style={{ marginRight: '5px' }} />}
            {isAiLoading ? 'Analyzing...' : 'Generate AI Training Plan'}
          </button>
        ) : <div/>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn-outline-dark" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>
      
      {aiAnalysis && (
        <div className="ai-analysis-results" style={{ marginTop: '20px', padding: '20px', background: 'rgba(246, 139, 31, 0.1)', border: '1px solid var(--accent-orange)', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> AI Skills Insights
          </h4>
          <p style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.5' }}>{aiAnalysis.analysis}</p>
          
          {aiAnalysis.identified_gaps && aiAnalysis.identified_gaps.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#ddd' }}>Identified Skill Gaps:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '5px', fontSize: '0.85rem', color: '#aaa' }}>
                {aiAnalysis.identified_gaps.map((gap, i) => (
                  <li key={i}><strong>{gap.skill}:</strong> {gap.gap}</li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.recommended_trainings && aiAnalysis.recommended_trainings.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#ddd' }}>Recommended Training Programs:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {aiAnalysis.recommended_trainings.map((training, i) => (
                  <div key={i} style={{ padding: '10px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{training.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>{training.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {employee && (
        <div className="employee-certifications-section" style={{ marginTop: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Uploaded Certifications</h4>
          {isCertsLoading ? (
            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Loading certifications...</div>
          ) : certifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certifications.map(cert => (
                <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{cert.certification_name || 'Unknown Certification'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                      Issued: {cert.issue_date} | Status: <span style={{ color: cert.verification_status === 'verified' ? '#4ade80' : cert.verification_status === 'rejected' ? '#f87171' : 'var(--accent-orange)' }}>{cert.verification_status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {cert.document ? (
                      <a href={cert.document} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#60a5fa', textDecoration: 'underline' }}>View File</a>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>No file</span>
                    )}
                    
                    <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                      {(cert.verification_status === 'pending' || cert.verification_status === 'rejected') && (
                        <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#4ade80', color: '#000' }} onClick={() => handleVerifyCert(cert.id)}>Verify</button>
                      )}
                      {(cert.verification_status === 'pending' || cert.verification_status === 'verified') && (
                        <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#f87171', border: '1px solid #f87171' }} onClick={() => handleRejectCert(cert.id)}>Reject</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>No certifications logged for this employee.</div>
          )}
        </div>
      )}
    </form>
  );
};

export default EmployeeForm;
