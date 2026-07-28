import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Users, Mail, UserPlus, Shield, UserCheck, UserX, 
  Trash2, Send, Edit, RefreshCw 
} from 'lucide-react';
import './Landing.css';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Restrict access to admin only
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Administrators only.');
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('employees/');
      setEmployees(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    try {
      await api.post('auth/invite/', {
        email: inviteEmail,
        role: inviteRole
      });
      toast.success(`Invitation successfully sent to ${inviteEmail}!`);
      setInviteEmail('');
      setInviteRole('employee');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleStatus = async (empId, currentStatus) => {
    try {
      await api.patch(`employees/${empId}/`, {
        is_active: !currentStatus
      });
      toast.success('User status updated successfully.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  const handleChangeRole = async (empId, newRole) => {
    try {
      await api.patch(`employees/${empId}/`, {
        role: newRole
      });
      toast.success(`Role updated to ${newRole.toUpperCase()}.`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.delete(`employees/${empId}/`);
      toast.success('User deleted successfully.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="landing-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '1.2rem' }}>Loading user administration panel...</p>
      </div>
    );
  }

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', padding: '100px 0 60px 0' }}>
      <div className="landing-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>User Administration</h1>
            <p style={{ color: 'var(--landing-text-muted)', margin: 0 }}>Invite new team members and manage existing system credentials.</p>
          </div>
          <button className="landing-btn landing-btn-outline" onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Invite User Widget */}
        <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--accent-orange, #f68b1f)" /> Send New Invite
          </h3>
          <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 2, minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="colleague@company.com"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--landing-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Assign System Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--landing-border)', background: '#111827', color: '#fff', cursor: 'pointer' }}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" disabled={inviteLoading} className="landing-btn landing-btn-primary" style={{ padding: '12px 24px' }}>
              {inviteLoading ? 'Sending...' : 'Send Invitation'} <Send size={16} />
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--landing-border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent-orange, #f68b1f)" /> Enrolled Users ({employees.length})
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>User / Employee ID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>System Role</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--landing-border)', transition: 'background 0.2s ease' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '600' }}>{emp.user?.first_name} {emp.user?.last_name || emp.user?.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--landing-text-muted)' }}>{emp.employee_id}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--landing-text-muted)' }}>{emp.user?.email || 'No email'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <select 
                        value={emp.user?.role || 'employee'} 
                        onChange={(e) => handleChangeRole(emp.id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--landing-border)', background: '#1f2937', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        onClick={() => handleToggleStatus(emp.id, emp.is_active)}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          border: 'none', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          background: emp.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: emp.is_active ? '#10b981' : '#ef4444' 
                        }}
                      >
                        {emp.is_active ? (
                          <><UserCheck size={14} /> Active</>
                        ) : (
                          <><UserX size={14} /> Suspended</>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteUser(emp.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserManagement;
