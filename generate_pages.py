import os

pages_dir = '/Users/mac/Desktop/Employees _system/frontend/src/pages'

COMPETENCIES = """import React, { useState, useEffect } from 'react';
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
      const [posRes, skillRes] = await Promise.all([
        api.get('/positions/'),
        api.get('/skills/')
      ]);
      setPositions(posRes.data);
      setSkills(skillRes.data);
      // Wait for competencies endpoint to be ready
      // const compRes = await api.get('/position-competencies/');
      // setCompetencies(compRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to save competency
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving competency:', error);
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
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No competencies defined yet. Add one above.</td></tr>
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
"""

TRAINING = """import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Training = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', trainer: '', date: '', capacity: '' });

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Training Programs</h2>
        </div>
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Create Training</span>
          </button>
        </div>
      </div>
      <div className="directory-table-container">
        <table className="directory-table">
          <thead><tr><th>Title</th><th>Trainer</th><th>Date</th><th>Capacity</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No training programs found.</td></tr>
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Training Program">
        <form className="employee-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Trainer Name</label>
            <input type="text" required value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Scheduled Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Training</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Training;
"""

CERTIFICATIONS = """import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Certifications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', organization: '', expiry_date: '' });

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Certifications</h2>
        </div>
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Log Certification</span>
          </button>
        </div>
      </div>
      <div className="directory-table-container">
        <table className="directory-table">
          <thead><tr><th>Name</th><th>Organization</th><th>Expiry Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No certifications logged.</td></tr>
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Certification">
        <form className="employee-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="form-group">
            <label>Certification Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Issuing Organization</label>
            <input type="text" required value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="date" required value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Certification</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Certifications;
"""

ASSESSMENTS = """import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Assessments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
          <thead><tr><th>Employee</th><th>Skill</th><th>Score</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No assessments recorded.</td></tr>
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Conduct Assessment">
        <form className="employee-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="form-group">
            <label>Score (1-100)</label>
            <input type="number" min="1" max="100" required />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea rows="3"></textarea>
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
"""

with open(os.path.join(pages_dir, 'Competencies.jsx'), 'w') as f: f.write(COMPETENCIES)
with open(os.path.join(pages_dir, 'Training.jsx'), 'w') as f: f.write(TRAINING)
with open(os.path.join(pages_dir, 'Certifications.jsx'), 'w') as f: f.write(CERTIFICATIONS)
with open(os.path.join(pages_dir, 'Assessments.jsx'), 'w') as f: f.write(ASSESSMENTS)
print("Forms created successfully!")
