import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Assessments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ employee: '', skill: '', score: '', comments: '' });
  const [assessments, setAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assRes, empRes, skillRes] = await Promise.all([
        api.get('/assessments/'),
        api.get('/employees/'),
        api.get('/skills/')
      ]);
      setAssessments(assRes.data.results || assRes.data);
      setEmployees(empRes.data.results || empRes.data);
      setSkills(skillRes.data.results || skillRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessments/', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Skills Assessments</h2>
        </div>
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Conduct Assessment</span>
          </button>
        </div>
      </div>
      <div className="directory-table-container">
        <table className="directory-table">
          <thead><tr><th>Employee</th><th>Skill</th><th>Score</th><th>Date</th><th>Assessor</th></tr></thead>
          <tbody>
            {assessments.map(a => (
              <tr key={a.id}>
                <td><strong>{a.employee_name}</strong></td>
                <td>{a.skill_name}</td>
                <td><span className="status-badge" style={{ backgroundColor: 'rgba(0,214,101,0.1)', color: 'var(--dark-forest)' }}>{a.score}/100</span></td>
                <td>{new Date(a.assessment_date).toLocaleDateString()}</td>
                <td>{a.assessor_name || 'System'}</td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No assessments recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Conduct Assessment">
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee</label>
            <select required value={formData.employee} onChange={e => setFormData({...formData, employee: e.target.value})}>
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.user?.first_name || 'Unknown'} {emp.user?.last_name || 'Employee'}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Skill</label>
            <select required value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})}>
              <option value="">Select Skill</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Score (1-100)</label>
            <input type="number" min="1" max="100" required value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea rows="3" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})}></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Submit Assessment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Assessments;
