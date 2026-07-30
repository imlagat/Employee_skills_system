import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Users, Mail, UserPlus, Shield, ShieldCheck, UserCheck, UserX, 
  Trash2, Send, Edit, RefreshCw, Clock, AlertCircle, Calendar, Copy, Share2
} from 'lucide-react';
import ShareInviteModal from '../components/ShareInviteModal';
import './Landing.css';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShareInvite, setSelectedShareInvite] = useState(null);

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
      const [empRes, inviteRes] = await Promise.all([
        api.get('employees/'),
        api.get('auth/invitations/')
      ]);
      setEmployees(empRes.data.results || empRes.data || []);
      setInvitations(inviteRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user and invitation lists.');
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
      fetchUsers();
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

  const handleRevokeInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      await api.delete(`auth/invitations/${inviteId}/`);
      toast.success('Invitation revoked successfully.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to revoke invitation.');
    }
  };

  const handleResendInvite = async (invite) => {
    try {
      const targetEmail = invite?.email || 'user';
      const targetId = invite?.id || invite;
      await api.post(`auth/invitations/${targetId}/resend/`);
      toast.success(`Invitation email resent to ${targetEmail}!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend invitation email.');
    }
  };

  const handleCopyInviteLink = (invite) => {
    const link = `${window.location.origin}/accept-invite/${invite.token}`;
    navigator.clipboard.writeText(link);
    toast.success(`Invitation link for ${invite.email} copied to clipboard!`);
  };

  const getInviteStatus = (invite) => {
    if (invite.is_accepted) return { label: 'Accepted', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    const expired = new Date(invite.expires_at) < new Date();
    if (expired) return { label: 'Expired', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    return { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  };

  if (loading && employees.length === 0) {
    return (
      <div className="landing-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '1.2rem' }}>Loading user admin panel...</p>
      </div>
    );
  }

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', padding: '100px 0 60px 0' }}>
      <div className="landing-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>User Admin</h1>
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
                <option value="admin">User Admin</option>
              </select>
            </div>
            <button type="submit" disabled={inviteLoading} className="landing-btn landing-btn-primary" style={{ padding: '12px 24px' }}>
              {inviteLoading ? 'Sending...' : 'Send Invitation'} <Send size={16} />
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px' }}>
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
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Privacy Consent</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const isAdminUser = emp.user?.role === 'admin';
                  const hasCompleted = emp.user?.has_completed_profile;
                  let statusBg = 'rgba(239, 68, 68, 0.15)';
                  let statusColor = '#ef4444';
                  let statusLabel = 'Suspended';
                  let StatusIcon = UserX;

                  if (emp.is_active) {
                    statusBg = 'rgba(16, 185, 129, 0.15)';
                    statusColor = '#10b981';
                    statusLabel = 'Active';
                    StatusIcon = UserCheck;
                  } else if (hasCompleted) {
                    statusBg = 'rgba(245, 158, 11, 0.15)';
                    statusColor = '#f59e0b';
                    statusLabel = 'Pending Approval';
                    StatusIcon = Clock;
                  } else {
                    statusBg = 'rgba(156, 163, 175, 0.15)';
                    statusColor = '#9ca3af';
                    statusLabel = 'Incomplete Profile';
                    StatusIcon = AlertCircle;
                  }

                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--landing-border)', transition: 'background 0.2s ease' }} className="table-row-hover">
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600' }}>{emp.user?.first_name} {emp.user?.last_name || emp.user?.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--landing-text-muted)' }}>{emp.employee_id}</div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--landing-text-muted)' }}>{emp.user?.email || 'No email'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        {isAdminUser ? (
                          <span style={{ fontSize: '0.8rem', background: 'rgba(246, 139, 31, 0.15)', color: 'var(--accent-orange, #f68b1f)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(246, 139, 31, 0.3)', display: 'inline-block' }} title="Admin details can only be edited in the Profile section">
                            Admin (Profile Only)
                          </span>
                        ) : (
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
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {emp.user?.has_accepted_consent ? (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={12} /> Consent Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: 'rgba(156, 163, 175, 0.12)', padding: '4px 8px', borderRadius: '12px' }}>
                            Legacy Account
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button 
                          onClick={() => !isAdminUser && handleToggleStatus(emp.id, emp.is_active)}
                          disabled={isAdminUser}
                          title={isAdminUser ? 'Admin details can only be edited in the Profile section' : statusLabel === 'Pending Approval' ? 'Click to Approve Profile' : 'Click to Toggle Status'}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            cursor: isAdminUser ? 'not-allowed' : 'pointer',
                            opacity: isAdminUser ? 0.7 : 1,
                            background: statusBg,
                            color: statusColor 
                          }}
                        >
                          <StatusIcon size={14} /> {statusLabel}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {!isAdminUser && (
                          <button 
                            onClick={() => handleDeleteUser(emp.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sent Invitations Logs Table */}
        <div style={{ background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--landing-border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--accent-orange, #f68b1f)" /> Sent Invitations ({invitations.length})
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {invitations.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--landing-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Invited Email</th>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Invitation Code / Token</th>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Target Role</th>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600' }}>Invited By</th>
                    <th style={{ padding: '16px 24px', color: 'var(--landing-text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(invite => {
                    const statusObj = getInviteStatus(invite);
                    return (
                      <tr key={invite.id} style={{ borderBottom: '1px solid var(--landing-border)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '600' }}>{invite.email}</td>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--landing-text-muted)' }}>{invite.token}</td>
                        <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{invite.role}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            display: 'inline-flex', 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold', 
                            background: statusObj.bg, 
                            color: statusObj.color 
                          }}>
                            {statusObj.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--landing-text-muted)' }}>{invite.invited_by}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {!invite.is_accepted && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedShareInvite(invite);
                                  setShareModalOpen(true);
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-orange, #f68b1f)', cursor: 'pointer', padding: '6px' }}
                                title="Share Invitation Settings & Options"
                              >
                                <Share2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleCopyInviteLink(invite)}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '6px' }}
                                title="Copy Invitation Link to Clipboard"
                              >
                                <Copy size={18} />
                              </button>
                              <button 
                                onClick={() => handleResendInvite(invite)}
                                style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '6px' }}
                                title={`Resend invitation email to ${invite.email}`}
                              >
                                <Send size={18} />
                              </button>
                              <button 
                                onClick={() => handleRevokeInvite(invite.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                title="Revoke / Delete Invitation"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--landing-text-muted)' }}>
                No invitations sent yet.
              </div>
            )}
          </div>
        </div>

      </div>

      <ShareInviteModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        invite={selectedShareInvite} 
      />
    </div>
  );
};

export default UserManagement;
