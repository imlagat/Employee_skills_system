import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Calendar, AlertCircle, FileText, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import './HRRequests.css';

const HRRequests = () => {
  // Active Tab
  const [activeTab, setActiveTab] = useState('leave');

  // Lists States
  const [leaves, setLeaves] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const [absenceForm, setAbsenceForm] = useState({
    date: '',
    reason: ''
  });

  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: ''
  });

  const [editingItem, setEditingItem] = useState(null);

  // Fetch histories on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [leaveRes, absRes, compRes] = await Promise.all([
        api.get('leave-requests/'),
        api.get('absence-reports/'),
        api.get('complaints/')
      ]);
      setLeaves(leaveRes.data.results || leaveRes.data || []);
      setAbsences(absRes.data.results || absRes.data || []);
      setComplaints(compRes.data.results || compRes.data || []);
    } catch (e) {
      toast.error('Failed to load request history.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item, type) => {
    setEditingItem({ id: item.id, type: type });
    setActiveTab(type);
    
    if (type === 'leave') {
      setLeaveForm({
        leave_type: item.leave_type,
        start_date: item.start_date,
        end_date: item.end_date,
        reason: item.reason || ''
      });
    } else if (type === 'absence') {
      setAbsenceForm({
        date: item.date,
        reason: item.reason || ''
      });
    } else if (type === 'complaint') {
      setComplaintForm({
        title: item.title,
        description: item.description || ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setLeaveForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' });
    setAbsenceForm({ date: '', reason: '' });
    setComplaintForm({ title: '', description: '' });
  };

  // Submissions
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'leave') {
        await api.patch(`leave-requests/${editingItem.id}/`, leaveForm);
        toast.success('Leave request updated successfully.');
      } else {
        await api.post('leave-requests/', leaveForm);
        toast.success('Leave request submitted successfully.');
      }
      setLeaveForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' });
      setEditingItem(null);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit leave request.');
    }
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'absence') {
        await api.patch(`absence-reports/${editingItem.id}/`, absenceForm);
        toast.success('Absence report updated successfully.');
      } else {
        await api.post('absence-reports/', absenceForm);
        toast.success('Absence report submitted successfully.');
      }
      setAbsenceForm({ date: '', reason: '' });
      setEditingItem(null);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to submit absence report.');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'complaint') {
        await api.patch(`complaints/${editingItem.id}/`, complaintForm);
        toast.success('Confidential complaint updated successfully.');
      } else {
        await api.post('complaints/', complaintForm);
        toast.success('Confidential complaint logged successfully.');
      }
      setComplaintForm({ title: '', description: '' });
      setEditingItem(null);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to log complaint.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return <span className="status-badge approved"><CheckCircle2 size={12} /> Approved/Resolved</span>;
      case 'rejected':
        return <span className="status-badge rejected"><XCircle size={12} /> Rejected</span>;
      case 'reviewed':
        return <span className="status-badge reviewed"><Clock size={12} /> Reviewed</span>;
      default:
        return <span className="status-badge pending"><Clock size={12} /> Pending Approval</span>;
    }
  };

  return (
    <div className="container hr-requests-page">
      <div className="page-header-container">
        <h2>HR Requests & Forms</h2>
        <p>Manage your leave requests, report workplace absences, or file confidential complaints to HR.</p>
      </div>

      {/* Tabs Row */}
      <div className="tabs-header-row">
        <button className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>
          <Calendar size={16} /> Request Leave
        </button>
        <button className={`tab-btn ${activeTab === 'absence' ? 'active' : ''}`} onClick={() => setActiveTab('absence')}>
          <AlertCircle size={16} /> Report Absence
        </button>
        <button className={`tab-btn ${activeTab === 'complaint' ? 'active' : ''}`} onClick={() => setActiveTab('complaint')}>
          <FileText size={16} /> File Confidential Complaint
        </button>
      </div>

      <div className="hr-layout-grid">
        {/* Forms Card */}
        <div className="glass-card form-card">
          {activeTab === 'leave' && (
            <form onSubmit={handleLeaveSubmit}>
              <h3>{editingItem ? 'Edit Leave Request' : 'Request Leave'}</h3>
              <div className="form-group">
                <label>Leave Type</label>
                <select 
                  value={leaveForm.leave_type} 
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  required
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave</label>
                <textarea 
                  rows="4"
                  placeholder="Provide supporting explanation here..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Submit Request'} <Send size={14} />
                </button>
                {editingItem && (
                  <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'absence' && (
            <form onSubmit={handleAbsenceSubmit}>
              <h3>{editingItem ? 'Edit Absence Report' : 'Report Workplace Absence'}</h3>
              <div className="form-group">
                <label>Date of Absence</label>
                <input 
                  type="date" 
                  value={absenceForm.date}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason for Absence</label>
                <textarea 
                  rows="5"
                  placeholder="Explain why you are unable to report to work today..."
                  value={absenceForm.reason}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, reason: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Report Absence'} <Send size={14} />
                </button>
                {editingItem && (
                  <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'complaint' && (
            <form onSubmit={handleComplaintSubmit}>
              <h3>{editingItem ? 'Edit Confidential Complaint' : 'Submit Confidential Complaint'}</h3>
              <p className="confidential-notice">
                ℹ️ All complaints submitted here are strictly confidential. They are visible only to system Administrators and HR personnel. Direct managers and peers have no visibility.
              </p>
              
              <div className="form-group">
                <label>Subject / Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Workplace safety concern"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Details / Description</label>
                <textarea 
                  rows="5"
                  placeholder="Provide detailed information regarding your complaint..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Log Confidential Complaint'} <Send size={14} />
                </button>
                {editingItem && (
                  <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* History Column */}
        <div className="history-column">
          <div className="glass-card history-card">
            <h3>Request History</h3>
            {loading ? (
              <p className="loading-text">Loading history...</p>
            ) : (
              <div className="history-items-container">
                {activeTab === 'leave' && (
                  leaves.length > 0 ? (
                    leaves.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title capitalize">{item.leave_type} Leave</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="item-details">
                          <span>📅 {item.start_date} to {item.end_date}</span>
                          {item.reason && <p className="item-reason">"{item.reason}"</p>}
                          {item.status === 'pending' && (
                            <button 
                              className="edit-req-btn"
                              onClick={() => handleEditClick(item, 'leave')}
                            >
                              Edit Request
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No leave requests logged yet.</p>
                )}

                {activeTab === 'absence' && (
                  absences.length > 0 ? (
                    absences.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title">Absence Report</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="item-details">
                          <span>📅 Date: {item.date}</span>
                          <p className="item-reason">"{item.reason}"</p>
                          {item.status === 'pending' && (
                            <button 
                              className="edit-req-btn"
                              onClick={() => handleEditClick(item, 'absence')}
                            >
                              Edit Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No absence reports logged yet.</p>
                )}

                {activeTab === 'complaint' && (
                  complaints.length > 0 ? (
                    complaints.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title">{item.title}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="item-details">
                          <p className="item-reason">"{item.description}"</p>
                          <span className="time-timestamp">Logged on {new Date(item.created_at).toLocaleDateString()}</span>
                          {item.status === 'pending' && (
                            <button 
                              className="edit-req-btn"
                              onClick={() => handleEditClick(item, 'complaint')}
                            >
                              Edit Complaint
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No confidential complaints logged yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRRequests;
