import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import api from '../api/axios';
import Skills from './Skills';
import Training from './Training';
import Certifications from './Certifications';
import AIGapAnalysis from '../components/AIGapAnalysis';
import AIPromotionReadiness from '../components/AIPromotionReadiness';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './EmployeeDetail.css';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
      const res = await api.get(`/employees/${id}/`);
      setEmployee(res.data);
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
      position: employee.position?.id || ''
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

  return (
    <div className="detail-page-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/people/employees')}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>

      {/* Basic Information Panel */}
      <div className="profile-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Basic Information</h3>
          {isManagerOrAdmin && (
            <button className="btn-outline-small" onClick={openEditModal} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Edit size={14} /> Edit Details
            </button>
          )}
        </div>
        <div className="panel-content">
          <div className="basic-info-layout">
            <div className="profile-avatar-large">
              {employee.user?.first_name?.[0] || employee.user?.username?.[0]}
            </div>
            
            <div className="info-column">
              <div className="info-row">
                <div className="info-label">Employee ID</div>
                <div className="info-value">{employee.employee_id}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Name</div>
                <div className="info-value">{employee.user?.first_name} {employee.user?.last_name}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Job Title</div>
                <div className="info-value">{employee.job_title || employee.position?.name || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">System Role</div>
                <div className="info-value capitalize">{employee.user?.role}</div>
              </div>
            </div>

            <div className="info-column">
              <div className="info-row">
                <div className="info-label">Department</div>
                <div className="info-value">
                  {employee.department?.id ? (
                    <span 
                      className="linkable" 
                      onClick={() => navigate(`/people/departments/${employee.department.id}`)}
                    >
                      {employee.department.name}
                    </span>
                  ) : (
                    employee.department?.name || 'No Department'
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Email</div>
                <div className="info-value">{employee.user?.email}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Phone</div>
                <div className="info-value">{employee.phone || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Hire Date</div>
                <div className="info-value">{employee.hire_date || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Sections: Side-by-Side Grid */}
      <div className="panels-grid">
        
        {/* Left Side: Skills & Competencies */}
        <div className="profile-panel">
          <div className="panel-header">
            <h3>Skills & Competencies</h3>
          </div>
          <div className="panel-content">
            <div className="sub-component-wrapper">
              <AIGapAnalysis employeeId={employee.id} />
              <Skills employeeId={employee.id} />
            </div>
          </div>
        </div>

        {/* Right Side: Training & Certifications */}
        <div className="profile-panel">
          <div className="panel-header">
            <h3>Training & Certifications</h3>
          </div>
          <div className="panel-content">
            <div className="sub-component-wrapper">
              <Training employeeId={employee.id} />
              <Certifications employeeId={employee.id} />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Performance & AI Insights */}
      <div className="profile-panel">
        <div className="panel-header">
          <h3>Performance & Analytics</h3>
        </div>
        <div className="panel-content">
          <AIPromotionReadiness employeeId={employee.id} />
          {/* In the future, assessment history table will go here */}
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
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-outline-small" onClick={() => setIsEditing(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default EmployeeDetail;
