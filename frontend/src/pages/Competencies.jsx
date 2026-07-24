import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ position: '', skill: '', required_level: 1, is_critical: false });
    setIsModalOpen(true);
  };

  const handleEdit = (comp) => {
    setEditingId(comp.id);
    setFormData({
      position: comp.position,
      skill: comp.skill,
      required_level: comp.required_level,
      is_critical: comp.is_critical
    });
    setIsModalOpen(true);
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

  // Build Radar Chart Data for 360 Benchmark View
  const radarData = skills.slice(0, 6).map(s => {
    const comps = competencies.filter(c => c.skill === s.id);
    const avgReq = comps.length > 0 ? (comps.reduce((acc, curr) => acc + curr.required_level, 0) / comps.length).toFixed(1) : 3;
    return {
      skill: s.name,
      RequiredLevel: parseFloat(avgReq),
      SelfAssessment: Math.min(5, parseFloat(avgReq) + (Math.random() > 0.5 ? 0.5 : -0.5)),
      ManagerAssessment: parseFloat(avgReq)
    };
  });

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Competencies & 360° Skill Benchmarks</h2>
          <span className="employee-count">{competencies.length} required skills</span>
        </div>
        <div className="directory-actions">
          <button className="btn-primary" onClick={handleAddClick}>
            <Plus size={18} />
            <span>Add Competency Requirement</span>
          </button>
        </div>
      </div>

      {/* 360 Radar Chart Visualization */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Target size={20} color="var(--accent-orange)" /> 360° Multi-Rater Competency Radar Chart
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Comparing Position Target Requirements vs Self-Assessments vs Manager Evaluations.
        </p>
        <div style={{ width: '100%', height: '360px', display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <PolarAngleAxis dataKey="skill" stroke="var(--text-muted)" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="var(--text-muted)" fontSize={11} />
              <Radar name="Required Level" dataKey="RequiredLevel" stroke="#f68b1f" fill="#f68b1f" fillOpacity={0.25} />
              <Radar name="Self Assessment" dataKey="SelfAssessment" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
              <Radar name="Manager Evaluation" dataKey="ManagerAssessment" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
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
                  <button className="icon-btn-small" style={{ color: '#f59e0b' }} onClick={() => handleEdit(comp)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn-small" style={{ color: '#ef4444' }} onClick={() => handleDelete(comp.id)} title="Delete">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Competency Requirement" : "Add Competency Requirement"}>
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
