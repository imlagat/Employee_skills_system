import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Competencies = () => {
  const [competencies, setCompetencies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ position: '', skill: '', required_level: 1, is_critical: false });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [posRes, skillRes, compRes] = await Promise.all([
        api.get('/positions/'),
        api.get('/skills/'),
        api.get('/position-competencies/')
      ]);
      setPositions(posRes.data.results || posRes.data);
      setSkills(skillRes.data.results || skillRes.data);
      setCompetencies(compRes.data.results || compRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/position-competencies/${editingId}/`, formData);
      } else {
        await api.post('/position-competencies/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving competency:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await api.delete(`/position-competencies/${id}/`);
        fetchData();
      } catch (error) {
        console.error('Error deleting competency:', error);
      }
    }
  };

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Competencies Framework</h2>
          <span className="employee-count">{competencies.length} required skills</span>
        </div>
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Competency Requirement</span>
          </button>
        </div>
      </div>
      <div className="directory-table-container">
        <table className="directory-table">
          <thead><tr><th>Position</th><th>Skill</th><th>Required Level</th><th>Critical</th><th>Actions</th></tr></thead>
          <tbody>
            {competencies.map(comp => (
              <tr key={comp.id}>
                <td><strong>{comp.position_name}</strong></td>
                <td>{comp.skill_name}</td>
                <td><span className="status-badge" style={{ backgroundColor: 'rgba(0,214,101,0.1)', color: 'var(--dark-forest)' }}>Level {comp.required_level}</span></td>
                <td>{comp.is_critical ? 'Yes' : 'No'}</td>
                <td className="actions-cell">
                  <button className="icon-btn-small" onClick={() => handleDelete(comp.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {competencies.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No competencies defined yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Competency Requirement">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Position</label>
            <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
              <option value="">Select Position</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
            <label>Required Level (1-5)</label>
            <input type="number" min="1" max="5" required value={formData.required_level} onChange={e => setFormData({...formData, required_level: e.target.value})} />
          </div>
          <div className="form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
            <input type="checkbox" checked={formData.is_critical} onChange={e => setFormData({...formData, is_critical: e.target.checked})} />
            <label style={{marginBottom: 0}}>Is Critical for Role?</label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Competency</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Competencies;
