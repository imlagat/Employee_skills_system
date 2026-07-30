import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import './EmployeeDirectory.css'; 

const Positions = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', department: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await api.get('/positions/');
      setPositions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenModal = (pos = null) => {
    if (pos) {
      setFormData({ 
        name: pos.name, 
        description: pos.description, 
        department: pos.department 
      });
      setEditingId(pos.id);
    } else {
      setFormData({ name: '', description: '', department: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/positions/${editingId}/`, formData);
      } else {
        await api.post('/positions/', formData);
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await api.delete(`/positions/${id}/`);
        fetchPositions();
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  const generatePosCode = (name) => {
    if (!name) return 'POS';
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return words.map(w => w[0].toUpperCase()).join('').substring(0, 3);
    }
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Positions</h2>
          <span className="employee-count">{positions.length} roles</span>
        </div>
        
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ height: '36px', padding: '6px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <Plus size={16} />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      <div className="directory-card-grid">
        {positions.map((pos) => (
          <div className="directory-card" key={pos.id} onClick={() => handleOpenModal(pos)} style={{ cursor: 'pointer' }}>
            <div className="card-header-flex">
              <div className="card-title-group">
                <h3>{pos.name}</h3>
                <span className="card-subtitle">ID: {generatePosCode(pos.name)}-{String(pos.id).padStart(3, '0')}</span>
              </div>
              <span className="card-badge">{getDeptName(pos.department)}</span>
            </div>
            
            <div className="card-body">
              <p>{pos.description || 'No description provided for this role.'}</p>
            </div>
            
            <div className="card-actions">
              <button className="icon-btn-small" style={{ color: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); navigate(`/people/positions/${pos.id}`); }} title="View">
                <Eye size={16} />
              </button>
              <button className="icon-btn-small" style={{ color: '#f59e0b' }} onClick={(e) => { e.stopPropagation(); handleOpenModal(pos); }} title="Edit">
                <Edit2 size={16} />
              </button>
              <button className="icon-btn-small" style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDelete(pos.id); }} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {positions.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            No positions found.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Position' : 'Add Position'}
      >
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Position Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select 
              required
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Role responsibilities..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Position</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Positions;
