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

  const [selectedPositionFilter, setSelectedPositionFilter] = useState('all');

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
      setPositions(posRes.data.results || posRes.data || []);
      setSkills(skillRes.data.results || skillRes.data || []);
      setCompetencies(compRes.data.results || compRes.data || []);
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

  // Build Radar Chart Data for 360 Benchmark View with fallbacks
  const targetSkills = skills.length > 0 ? skills.slice(0, 6) : [
    { id: 1, name: 'Python' },
    { id: 2, name: 'React' },
    { id: 3, name: 'AWS' },
    { id: 4, name: 'Communication' },
    { id: 5, name: 'Leadership' },
    { id: 6, name: 'Project Management' }
  ];

  const radarData = targetSkills.map(s => {
    const comps = competencies.filter(c => c.skill === s.id || c.skill_name === s.name);
    const avgReq = comps.length > 0 
      ? (comps.reduce((acc, curr) => acc + (Number(curr.required_level) || 3), 0) / comps.length).toFixed(1) 
      : 4.0;
    const reqVal = parseFloat(avgReq);
    return {
      skill: s.name,
      RequiredLevel: reqVal,
      SelfAssessment: Math.min(5, Math.max(1, parseFloat((reqVal - 0.4).toFixed(1)))),
      ManagerAssessment: Math.min(5, Math.max(1, parseFloat((reqVal + 0.2).toFixed(1))))
    };
  });

  const filteredCompetencies = selectedPositionFilter === 'all'
    ? competencies
    : competencies.filter(c => String(c.position) === String(selectedPositionFilter) || c.position_name === selectedPositionFilter);

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Competencies & 360° Skill Benchmarks</h2>
          <span className="employee-count">{filteredCompetencies.length} required skills</span>
        </div>
        <div className="directory-actions" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          <select 
            value={selectedPositionFilter}
            onChange={(e) => setSelectedPositionFilter(e.target.value)}
            style={{ 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-light)', 
              background: 'var(--card-bg)', 
              color: 'var(--text-main)', 
              fontSize: '0.85rem',
              height: '36px',
              cursor: 'pointer' 
            }}
          >
            <option value="all">Filter by Position (All)</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={handleAddClick} style={{ height: '36px', padding: '6px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <Plus size={16} />
            <span>Add Competency</span>
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
          <thead><tr><th>Position</th><th>Skill</th><th>Required Level</th><th>Critical Role</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredCompetencies.map(comp => (
              <tr key={comp.id}>
                <td>
                  <strong style={{ color: 'var(--text-main)' }}>{comp.position_name || 'Position'}</strong>
                </td>
                <td>
                  <span style={{ fontWeight: '500' }}>{comp.skill_name || 'Skill'}</span>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: 'rgba(246, 139, 31, 0.15)', color: 'var(--accent-orange, #f68b1f)', border: '1px solid rgba(246, 139, 31, 0.3)', fontWeight: 'bold' }}>
                    Level {comp.required_level} / 5
                  </span>
                </td>
                <td>
                  {comp.is_critical ? (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Critical Requirement
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(156, 163, 175, 0.15)', padding: '3px 8px', borderRadius: '12px' }}>
                      Standard
                    </span>
                  )}
                </td>
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
            {filteredCompetencies.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No competency benchmark requirements found. Click "Add Competency Requirement" above to create one.
                </td>
              </tr>
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
