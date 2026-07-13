import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Eye, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [employees, setEmployees] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // directory, pending

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('employees/');
      setEmployees(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching employees", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUpdates = async () => {
    if (!isAdmin && user?.role !== 'manager' && user?.role !== 'hr') return;
    try {
      const res = await api.get('profile-updates/?status=pending');
      setPendingUpdates(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching pending updates", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPendingUpdates();
  }, [user]);

  const handleAddClick = () => {
    // In the future, this could navigate to a dedicated /people/employees/new page
    toast.error('Add Employee form moved to dedicated page (Coming soon)');
  };

  const handleEditClick = (employee) => {
    navigate(`/people/employees/${employee.id}`);
  };

  const handleDeleteEmployee = async (empId) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      try {
        await api.delete(`employees/${empId}/`);
        toast.success("Employee deleted successfully.");
        fetchEmployees();
      } catch (err) {
        console.error("Error deleting employee", err);
        toast.error("Failed to delete employee.");
      }
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const firstName = emp.user?.first_name || '';
    const lastName = emp.user?.last_name || '';
    const posName = emp.position?.name || '';
    const deptName = emp.department?.name || '';
    const s = search.toLowerCase();
    
    return firstName.toLowerCase().includes(s) ||
           lastName.toLowerCase().includes(s) ||
           posName.toLowerCase().includes(s) ||
           deptName.toLowerCase().includes(s);
  });

  const handleApproveUpdate = async (id) => {
    try {
      await api.post(`profile-updates/${id}/approve/`);
      toast.success("Profile update approved!");
      fetchPendingUpdates();
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to approve update.");
    }
  };

  const handleRejectUpdate = async (id) => {
    try {
      await api.post(`profile-updates/${id}/reject/`);
      toast.success("Profile update rejected.");
      fetchPendingUpdates();
    } catch (err) {
      toast.error("Failed to reject update.");
    }
  };

  return (
    <div className="directory-page">
      <div className="page-header">
        <div>
          <h2>Employee Directory</h2>
          <p>Manage your workforce and their details</p>
        </div>
        <button className="btn-primary flex-center" onClick={handleAddClick}>
          <Plus size={18} style={{marginRight: '8px'}} /> Add Employee
        </button>
      </div>

      <div className="directory-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div 
            onClick={() => setActiveTab('directory')}
            style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'directory' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'directory' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'directory' ? 'bold' : 'normal' }}
          >
            All Employees
          </div>
          {(isAdmin || user?.role === 'manager' || user?.role === 'hr') && (
            <div 
              onClick={() => setActiveTab('pending')}
              style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'pending' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'pending' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'pending' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Pending Edits
              {pendingUpdates.length > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>{pendingUpdates.length}</span>
              )}
            </div>
          )}
        </div>
        
        {activeTab === 'directory' && (
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="directory-content">
        {activeTab === 'directory' && (
          loading ? (
            <div className="loading-state">Loading employees...</div>
          ) : (
            <div className="directory-card-grid">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <div className="directory-card" key={emp.id} onClick={() => handleEditClick(emp)} style={{ cursor: 'pointer' }}>
                    <div className="card-header-flex">
                      <div className="employee-card-profile" style={{ marginBottom: 0 }}>
                        <div className="employee-card-avatar">{emp.user?.first_name?.[0]}{emp.user?.last_name?.[0]}</div>
                        <div className="employee-card-details">
                          <div className="name-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{emp.user?.first_name} {emp.user?.last_name}</div>
                          <div className="email-text">{emp.user?.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="detail-row"><strong>ID:</strong> {emp.employee_id}</div>
                      <div className="detail-row"><strong>Title:</strong> {emp.position?.name || 'N/A'}</div>
                      <div className="detail-row"><strong>Dept:</strong> <span className="dept-badge" style={{ display: 'inline-block', marginTop: '4px' }}>{emp.department?.name || 'N/A'}</span></div>
                      <div className="detail-row" style={{ marginTop: '4px' }}><strong>Role:</strong> <span className="capitalize">{emp.user?.role}</span></div>
                    </div>
                    
                    <div className="card-actions">
                      <button className="icon-btn-small" style={{ color: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); handleEditClick(emp); }} title="View">
                        <Eye size={16} />
                      </button>
                      {isAdmin && (
                        <button className="icon-btn-small" style={{ color: '#f87171' }} onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No employees found.</div>
              )}
            </div>
          )
        )}
        
        {activeTab === 'pending' && (
          <div className="directory-card-grid">
            {pendingUpdates.length > 0 ? (
              pendingUpdates.map(update => (
                <div className="directory-card" key={update.id}>
                  <div className="card-header-flex">
                    <div className="card-title-group">
                      <h3>{update.employee_name}</h3>
                      <span className="card-subtitle">Submitted: {new Date(update.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="card-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Pending</span>
                  </div>
                  
                  <div className="card-body">
                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Requested Changes</h4>
                    <div style={{ fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                      {Object.entries(update.requested_changes).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '4px' }}><strong className="capitalize">{key.replace('_', ' ')}:</strong> <span style={{ color: 'white' }}>{value}</span></div>
                      ))}
                      {update.profile_image && <div style={{ marginTop: '8px' }}><strong>Profile Image:</strong> <span style={{ color: '#4ade80' }}>New File Uploaded</span></div>}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="btn-outline-small flex-center" style={{ borderColor: '#4ade80', color: '#4ade80', padding: '6px 12px', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleApproveUpdate(update.id)}>
                      <Check size={16} style={{ marginRight: '4px' }} /> Approve
                    </button>
                    <button className="btn-outline-small flex-center" style={{ borderColor: '#f87171', color: '#f87171', padding: '6px 12px', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleRejectUpdate(update.id)}>
                      <X size={16} style={{ marginRight: '4px' }} /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No pending profile updates.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectory;
