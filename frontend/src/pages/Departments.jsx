import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import './EmployeeDirectory.css'; 

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setFormData({ name: dept.name, description: dept.description });
      setEditingId(dept.id);
    } else {
      setFormData({ name: '', description: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/departments/${editingId}/`, formData);
      } else {
        await api.post('/departments/', formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}/`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const generateDeptCode = (name) => {
    if (!name) return 'DPT';
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
          <h2>Departments</h2>
          <span className="employee-count">{departments.length} total</span>
        </div>
        
        <div className="directory-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ height: '36px', padding: '6px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      <div className="directory-card-grid">
        {departments.map((dept) => (
          <div className="directory-card" key={dept.id} onClick={() => handleOpenModal(dept)} style={{ cursor: 'pointer' }}>
            <div className="card-header-flex">
              <div className="card-title-group">
                <h3>{dept.name}</h3>
                <span className="card-subtitle">ID: {generateDeptCode(dept.name)}-{String(dept.id).padStart(3, '0')}</span>
              </div>
            </div>
            
            <div className="card-body">
              <p>{dept.description || 'No description provided for this department.'}</p>
            </div>
            
            <div className="card-actions">
              <button className="icon-btn-small" style={{ color: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); navigate(`/people/departments/${dept.id}`); }} title="View">
                <Eye size={16} />
              </button>
              <button className="icon-btn-small" style={{ color: '#f59e0b' }} onClick={(e) => { e.stopPropagation(); handleOpenModal(dept); }} title="Edit">
                <Edit2 size={16} />
              </button>
              <button className="icon-btn-small" style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            No departments found.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Information Technology"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Department description..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
