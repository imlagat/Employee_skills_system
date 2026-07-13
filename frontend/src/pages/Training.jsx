import React, { useState, useEffect, useContext } from 'react';
import { Plus, Check, X, BookOpen } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const Training = ({ employeeId }) => {
  const { user } = useContext(AuthContext);
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', start_date: '', end_date: '', capacity: '' });
  
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState(employeeId ? 'enrollments' : 'catalog');

  useEffect(() => {
    if (!employeeId) {
      fetchPrograms();
    }
    fetchEnrollments();
  }, [employeeId]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs/');
      setPrograms(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const url = employeeId ? `/enrollments/?employee=${employeeId}` : '/enrollments/';
      const res = await api.get(url);
      setEnrollments(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/programs/', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', location: '', start_date: '', end_date: '', capacity: '' });
      fetchPrograms();
      toast.success("Training program created!");
    } catch (e) {
      console.error(e);
      toast.error('Failed to create training');
    }
  };

  const handleEnroll = async (programId) => {
    try {
      await api.post(`/programs/${programId}/enroll/`);
      toast.success("Enrollment requested! Pending manager approval.");
      fetchPrograms();
      fetchEnrollments();
      setActiveTab('enrollments');
    } catch (e) {
      console.error(e);
      toast.error('Failed to enroll. Make sure you have an employee profile linked.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/enrollments/${id}/approve/`);
      fetchEnrollments();
      toast.success("Enrollment approved.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to approve enrollment.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/enrollments/${id}/reject/`);
      fetchEnrollments();
      toast.success("Enrollment rejected.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reject enrollment.");
    }
  };

  return (
    <div className={employeeId ? "embedded-view" : "directory-container"}>
      {!employeeId && (
        <>
          <div className="directory-header">
            <div className="directory-title">
              <h2>Training & Development</h2>
              <p>Browse courses and manage enrollments</p>
            </div>
            <div className="directory-actions">
              {isManagerOrAdmin && (
                <button className="btn-primary flex-center" onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} style={{marginRight: '8px'}} /> Create Training
                </button>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div 
              onClick={() => setActiveTab('catalog')}
              style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'catalog' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'catalog' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal' }}
            >
              Course Catalog
            </div>
            <div 
              onClick={() => setActiveTab('enrollments')}
              style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'enrollments' ? 'var(--accent-orange)' : '#aaa', borderBottom: activeTab === 'enrollments' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontWeight: activeTab === 'enrollments' ? 'bold' : 'normal' }}
            >
              {isManagerOrAdmin ? "All Enrollments & Approvals" : "My Enrollments"}
            </div>
          </div>
        </>
      )}

      <div className="directory-table-container">
        {activeTab === 'catalog' && (
          <div className="training-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {programs.map(p => (
              <div key={p.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 5px 0' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>📍 Location:</strong> {p.location || 'Online'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>📅 Start Date:</strong> {p.start_date}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>👥 Capacity:</strong> {p.capacity ? `${p.seats_taken || 0} / ${p.capacity}` : 'Unlimited'}</div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--border-light)' }}>
                  <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => handleEnroll(p.id)}>
                    <BookOpen size={16} /> Enroll Now
                  </button>
                </div>
              </div>
            ))}
            {programs.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No training programs available.
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollments' && (
          (!employeeId && !isManagerOrAdmin) ? (
            <div className="training-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {enrollments.map(e => (
                <div key={e.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 5px 0' }}>{e.program_name || e.program}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Enrolled On: {new Date(e.enrolled_on).toLocaleDateString()}</p>
                  </div>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block',
                      backgroundColor: e.status === 'enrolled' ? 'rgba(40, 167, 69, 0.1)' : 
                                       e.status === 'cancelled' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(246, 139, 31, 0.1)',
                      color: e.status === 'enrolled' ? '#10b981' : 
                             e.status === 'cancelled' ? '#ef4444' : 'var(--accent-orange)'
                    }}>
                      {e.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {enrollments.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No enrollments found.
                </div>
              )}
            </div>
          ) : (
            <table className="directory-table">
              <thead><tr>
                {(!employeeId && isManagerOrAdmin) && <th>Employee</th>}
                <th>Program</th><th>Status</th><th>Enrolled On</th>{isManagerOrAdmin && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {enrollments.map(e => (
                  <tr key={e.id}>
                    {(!employeeId && isManagerOrAdmin) && <td>{e.employee_name || 'Me'}</td>}
                    <td><strong>{e.program_name || e.program}</strong></td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                        backgroundColor: e.status === 'enrolled' ? 'rgba(40, 167, 69, 0.2)' : 
                                        e.status === 'cancelled' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(246, 139, 31, 0.2)',
                        color: e.status === 'enrolled' ? '#4ade80' : 
                              e.status === 'cancelled' ? '#f87171' : 'var(--accent-orange)'
                      }}>
                        {e.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(e.enrolled_on).toLocaleDateString()}</td>
                    {isManagerOrAdmin && (
                      <td>
                        {e.status === 'pending_approval' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-btn-small" style={{ color: '#4ade80' }} onClick={() => handleApprove(e.id)} title="Approve">
                              <Check size={16} />
                            </button>
                            <button className="icon-btn-small" style={{ color: '#f87171' }} onClick={() => handleReject(e.id)} title="Reject">
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr><td colSpan={isManagerOrAdmin ? "5" : "4"} style={{textAlign: 'center', padding: '20px'}}>No enrollments found.</td></tr>
                )}
              </tbody>
            </table>
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Training Program">
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Online or Room 101" />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Capacity (0 for unlimited)</label>
            <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
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
