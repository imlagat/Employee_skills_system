import React, { useState, useEffect, useContext } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css'; 

const Skills = ({ employeeId }) => {
  const { user } = useContext(AuthContext);
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  const [activeTab, setActiveTab] = useState('gaps');
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [gapsData, setGapsData] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', description: '', rating: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      fetchSkills();
    }
    fetchGaps();
  }, [employeeId]);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills/');
      setSkills(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchGaps = async () => {
    try {
      let targetId = employeeId;
      if (!targetId) {
        const meRes = await api.get('/employees/me/');
        targetId = meRes.data.id;
      }
      
      const [gapRes, skillsRes] = await Promise.all([
        api.get(`/employees/${targetId}/competency_gaps/`),
        api.get(`/employee-skills/?employee=${targetId}`)
      ]);
      setGapsData(gapRes.data);
      setMySkills(skillsRes.data.results || skillsRes.data);
    } catch (error) {
      console.error('Error fetching gaps:', error);
    }
  };

  const handleOpenModal = (skill = null) => {
    if (skill) {
      setFormData({ name: skill.name, category: skill.category, description: skill.description, rating: skill.rating || 0 });
      setEditingId(skill.id);
    } else {
      setFormData({ name: '', category: '', description: '', rating: 0 });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/skills/${editingId}/`, formData);
        toast.success("Skill updated!");
      } else {
        await api.post('/skills/', formData);
        toast.success("Skill added!");
      }
      setIsModalOpen(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error("Failed to save skill.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/skills/${id}/`);
      fetchSkills();
      toast.success("Skill deleted.");
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error("Failed to delete skill.");
    }
  };



  const renderGapsTable = () => (
    <>
      <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>My Current Skills</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Skills and proficiencies currently logged on your profile.</p>
      </div>
      
      <div className="skills-grid" style={{ marginBottom: '40px' }}>
        {mySkills.length > 0 ? mySkills.map(es => (
          <div key={es.id} className="skill-card">
            <div className="skill-card-header">
              <h3 className="skill-card-title">{es.skill_name}</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: 'inherit', fontWeight: 'inherit' }}>
                {es.skill_category || 'Uncategorized'}
              </span>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>PROFICIENCY LEVEL</div>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={20} 
                    fill={(es.proficiency || 0) >= star ? "#f59e0b" : "transparent"}
                    className={`star ${(es.proficiency || 0) >= star ? 'filled' : ''} readonly`}
                  />
                ))}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
            No skills currently logged for this profile.
          </div>
        )}
      </div>

      {gapsData ? (
        <>
          <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Competency Gaps for {gapsData.position}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>These are the skills required for the position where proficiency is below the required level.</p>
          </div>
          <table className="directory-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Required Level (1-5)</th>
                <th>Current Level</th>
                <th>Gap</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {gapsData.gaps.map((g, idx) => (
                <tr key={idx}>
                  <td><strong>{g.skill_name}</strong></td>
                  <td>{g.category}</td>
                  <td>{g.required_level}</td>
                  <td>{g.current_level}</td>
                  <td><span style={{ color: '#f87171', fontWeight: 'bold' }}>-{g.gap_size}</span></td>
                  <td>
                    {g.is_critical ? 
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171' }}><AlertTriangle size={14}/> Critical</span> : 
                      <span style={{ color: 'var(--accent-orange)' }}>Standard</span>
                    }
                  </td>
                </tr>
              ))}
              {gapsData.gaps.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <CheckCircle size={32} style={{ color: '#4ade80', marginBottom: '10px' }} />
                    <div>No competency gaps! All requirements are met.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading gap analysis...</div>
      )}
    </>
  );

  if (employeeId) {
    return (
      <div className="embedded-view">
        {renderGapsTable()}
      </div>
    );
  }

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Skills & Competencies</h2>
          <p>Track your skills and view required competencies</p>
        </div>
        
        <div className="directory-actions">
          {isManagerOrAdmin && activeTab === 'catalog' && (
            <button className="btn-primary" onClick={() => handleOpenModal()} style={{ height: '36px', padding: '6px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <Plus size={16} />
              <span>Add Skill</span>
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div 
          onClick={() => setActiveTab('gaps')}
          style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'gaps' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'gaps' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'gaps' ? 'bold' : 'normal' }}
        >
          My Skills & Gaps
        </div>
        <div 
          onClick={() => setActiveTab('catalog')}
          style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'catalog' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'catalog' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal' }}
        >
          Organization Skill Catalog
        </div>
      </div>

      <div className="directory-table-container">
        {activeTab === 'gaps' && renderGapsTable()}

        {activeTab === 'catalog' && (
          <div className="skills-grid">
            {skills.map((skill) => (
              <div key={skill.id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3 className="skill-card-title">{skill.name}</h3>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'inherit', fontWeight: 'inherit', marginTop: '8px', display: 'inline-block' }}>
                      {skill.category || 'Uncategorized'}
                    </span>
                  </div>
                  {isManagerOrAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn-small" onClick={() => handleOpenModal(skill)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn-small" onClick={() => handleDelete(skill.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="skill-card-desc">{skill.description || 'No description available.'}</p>
                
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>ORGANIZATION RATING</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={(skill.rating || 0) >= star ? "#f59e0b" : "transparent"}
                          className={`star ${(skill.rating || 0) >= star ? 'filled' : ''} readonly`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No skills found. Click "Add Skill" to create one.
              </div>
            )}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Skill' : 'Add Skill'}
      >
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Skill Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Python, Leadership"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input 
              type="text" 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. Programming, Soft Skills"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Skill description..."
            />
          </div>
          
          <div className="form-group">
            <label>Organization Rating (1-5)</label>
            <div className="star-rating" style={{ marginTop: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={24} 
                  fill={formData.rating >= star ? "#f59e0b" : "transparent"}
                  className={`star ${formData.rating >= star ? 'filled' : ''}`}
                  onClick={() => setFormData({...formData, rating: star})}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Skill</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Skills;
