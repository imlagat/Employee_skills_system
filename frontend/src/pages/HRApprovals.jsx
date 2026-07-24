import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { 
  Check, X, Calendar, AlertCircle, FileText, 
  Clock, CheckSquare, ShieldAlert, User, MessageSquare
} from 'lucide-react';
import './HRApprovals.css';

const HRApprovals = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('leave');
  
  // Lists
  const [leaves, setLeaves] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, absRes] = await Promise.all([
        api.get('leave-requests/'),
        api.get('absence-reports/')
      ]);
      setLeaves(leaveRes.data.results || leaveRes.data || []);
      setAbsences(absRes.data.results || absRes.data || []);

      // Complaints are confidential - only load if admin or hr
      if (user?.role === 'admin' || user?.role === 'hr') {
        const compRes = await api.get('complaints/');
        setComplaints(compRes.data.results || compRes.data || []);
      }
    } catch (e) {
      toast.error('Failed to load pending requests.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleLeaveAction = async (id, action) => {
    try {
      await api.post(`leave-requests/${id}/${action}/`);
      toast.success(`Leave request ${action}ed.`);
      fetchData();
    } catch (e) {
      toast.error(`Failed to ${action} leave request.`);
    }
  };

  const handleAbsenceAction = async (id, action) => {
    try {
      await api.post(`absence-reports/${id}/${action}/`);
      toast.success(`Absence report ${action}ed.`);
      fetchData();
    } catch (e) {
      toast.error(`Failed to ${action} absence report.`);
    }
  };

  const handleComplaintStatus = async (id, statusVal) => {
    try {
      await api.patch(`complaints/${id}/`, { status: statusVal });
      toast.success(`Complaint status updated to ${statusVal}.`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update complaint status.');
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const historyLeaves = leaves.filter(l => l.status !== 'pending');

  const pendingAbsences = absences.filter(a => a.status === 'pending');
  const historyAbsences = absences.filter(a => a.status !== 'pending');

  const pendingComplaints = complaints.filter(c => c.status === 'pending');
  const historyComplaints = complaints.filter(c => c.status !== 'pending');

  const isHRorAdmin = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="container hr-approvals-page">
      <div className="page-header-container">
        <h2>HR Requests Approvals</h2>
        <p>Review leaves, absences, and confidential feedback reports submitted by your team.</p>
      </div>

      {/* Tabs Row */}
      <div className="tabs-header-row">
        <button className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>
          <Calendar size={16} /> Leaves ({pendingLeaves.length})
        </button>
        <button className={`tab-btn ${activeTab === 'absence' ? 'active' : ''}`} onClick={() => setActiveTab('absence')}>
          <AlertCircle size={16} /> Absences ({pendingAbsences.length})
        </button>
        <button className={`tab-btn ${activeTab === 'complaint' ? 'active' : ''}`} onClick={() => setActiveTab('complaint')}>
          <FileText size={16} /> Confidential Complaints ({isHRorAdmin ? pendingComplaints.length : 'Restricted'})
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading requests data...</p>
      ) : (
        <div className="approvals-grid">
          
          {/* Main List Section */}
          <div className="glass-card approvals-main-card">
            
            {/* 1. Leaves approvals */}
            {activeTab === 'leave' && (
              <div className="tab-content-wrapper">
                <h3>Pending Leave Approvals</h3>
                {pendingLeaves.length > 0 ? (
                  <div className="approvals-list">
                    {pendingLeaves.map(item => (
                      <div key={item.id} className="approval-card-item">
                        <div className="card-item-left">
                          <div className="user-icon-circle"><User size={20} /></div>
                          <div className="card-item-details">
                            <span className="employee-name-label">{item.employee_name}</span>
                            <span className="leave-meta-tag capitalize">{item.leave_type} Leave</span>
                            <span className="date-range-label">📅 {item.start_date} to {item.end_date}</span>
                            {item.reason && <p className="reason-text">"{item.reason}"</p>}
                          </div>
                        </div>
                        <div className="card-item-actions">
                          <button className="action-btn approve" onClick={() => handleLeaveAction(item.id, 'approve')} title="Approve">
                            <Check size={16} /> Approve
                          </button>
                          <button className="action-btn reject" onClick={() => handleLeaveAction(item.id, 'reject')} title="Reject">
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted">No pending leave requests found.</p>}
              </div>
            )}

            {/* 2. Absences approvals */}
            {activeTab === 'absence' && (
              <div className="tab-content-wrapper">
                <h3>Pending Absence Approvals</h3>
                {pendingAbsences.length > 0 ? (
                  <div className="approvals-list">
                    {pendingAbsences.map(item => (
                      <div key={item.id} className="approval-card-item">
                        <div className="card-item-left">
                          <div className="user-icon-circle"><User size={20} /></div>
                          <div className="card-item-details">
                            <span className="employee-name-label">{item.employee_name}</span>
                            <span className="date-range-label">📅 Absence Date: {item.date}</span>
                            <p className="reason-text">"{item.reason}"</p>
                          </div>
                        </div>
                        <div className="card-item-actions">
                          <button className="action-btn approve" onClick={() => handleAbsenceAction(item.id, 'approve')} title="Approve">
                            <Check size={16} /> Approve
                          </button>
                          <button className="action-btn reject" onClick={() => handleAbsenceAction(item.id, 'reject')} title="Reject">
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted">No pending absence reports found.</p>}
              </div>
            )}

            {/* 3. Complaints Approvals */}
            {activeTab === 'complaint' && (
              <div className="tab-content-wrapper">
                <h3>Confidential Complaints Inbox</h3>
                {!isHRorAdmin ? (
                  <div className="restricted-warning-box">
                    <ShieldAlert size={48} className="text-orange" />
                    <h4>Access Restricted</h4>
                    <p>Confidential complaints are strictly protected. Only HR and Administrator accounts can inspect and resolve these filings.</p>
                  </div>
                ) : (
                  pendingComplaints.length > 0 ? (
                    <div className="approvals-list">
                      {pendingComplaints.map(item => (
                        <div key={item.id} className="approval-card-item">
                          <div className="card-item-left">
                            <div className="user-icon-circle purple"><MessageSquare size={20} /></div>
                            <div className="card-item-details">
                              <span className="complaint-title-label">{item.title}</span>
                              <span className="submitting-employee">Submitted by: <strong>{item.employee_name}</strong></span>
                              <p className="reason-text">"{item.description}"</p>
                              <span className="complaint-time">Logged on: {new Date(item.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="card-item-actions vertical">
                            <button className="action-btn approve" onClick={() => handleComplaintStatus(item.id, 'reviewed')}>
                              Mark Reviewed
                            </button>
                            <button className="action-btn resolve" onClick={() => handleComplaintStatus(item.id, 'resolved')}>
                              Mark Resolved
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted">No pending confidential complaints found.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar / History Section */}
          <div className="history-sidebar-section">
            <div className="glass-card history-approvals-card">
              <h3>Archived History</h3>
              
              <div className="history-items-container">
                {activeTab === 'leave' && (
                  historyLeaves.length > 0 ? (
                    historyLeaves.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title">{item.employee_name}</span>
                          <span className={`status-badge ${item.status}`}>{item.status}</span>
                        </div>
                        <div className="item-details">
                          <span className="capitalize">{item.leave_type} Leave</span>
                          <span>📅 {item.start_date} to {item.end_date}</span>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No historical leaves recorded.</p>
                )}

                {activeTab === 'absence' && (
                  historyAbsences.length > 0 ? (
                    historyAbsences.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title">{item.employee_name}</span>
                          <span className={`status-badge ${item.status}`}>{item.status}</span>
                        </div>
                        <div className="item-details">
                          <span>📅 Date: {item.date}</span>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No historical absences recorded.</p>
                )}

                {activeTab === 'complaint' && isHRorAdmin && (
                  historyComplaints.length > 0 ? (
                    historyComplaints.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="item-title">{item.title}</span>
                          <span className={`status-badge ${item.status}`}>{item.status}</span>
                        </div>
                        <div className="item-details">
                          <span>By: {item.employee_name}</span>
                          <span>Updated on: {new Date(item.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted">No historical complaints recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRApprovals;
