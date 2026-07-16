import React, { useState, useEffect, useContext } from 'react';
import { Plus, Check, X } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const Certifications = ({ employeeId }) => {
  const { user } = useContext(AuthContext);
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  const [isModalOpen, setIsModalOpen] = useState(false);
  // We need to pick a certification from the global dictionary
  const [globalCerts, setGlobalCerts] = useState([]);
  
  const [formData, setFormData] = useState({ 
    certification_id: '', 
    custom_certification_name: '',
    issue_date: '', 
    expiry_date: '',
    credential_id: '', 
    document: null 
  });
  
  const [employeeCerts, setEmployeeCerts] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchEmployeeCerts();
    fetchGlobalCerts();
  }, []);

  const fetchEmployeeCerts = async () => {
    try {
      const url = employeeId ? `/employee-certifications/?employee=${employeeId}` : '/employee-certifications/';
      const res = await api.get(url);
      setEmployeeCerts(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGlobalCerts = async () => {
    try {
      const res = await api.get('/certifications/');
      setGlobalCerts(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUploadStatus('uploading');
    setUploadProgress(0);

    let finalCertId = formData.certification_id;

    try {
      if (finalCertId === 'custom') {
        const newCertRes = await api.post('/certifications/', {
          name: formData.custom_certification_name,
          issuing_body: 'Custom' // Default or could add another field
        });
        finalCertId = newCertRes.data.id;
      }

      const data = new FormData();
      data.append('certification', finalCertId);
      data.append('issue_date', formData.issue_date);
      if (formData.expiry_date) {
        data.append('expiry_date', formData.expiry_date);
      }
      data.append('credential_id', formData.credential_id);
      if (formData.document) {
        data.append('document', formData.document);
      }
      await api.post('/employee-certifications/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setUploadStatus('success');
      toast.success("Certification logged successfully!");
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ certification_id: '', custom_certification_name: '', issue_date: '', expiry_date: '', credential_id: '', document: null });
        setUploadStatus('idle');
        setUploadProgress(0);
        fetchEmployeeCerts();
        fetchGlobalCerts(); // Refresh global certs in case they want to use the new one later
      }, 1500);
    } catch (e) {
      console.error(e);
      setUploadStatus('error');
      toast.error('Failed to save certification. Ensure your employee profile exists.');
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/employee-certifications/${id}/verify/`);
      fetchEmployeeCerts();
      toast.success("Certification verified!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to verify");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/employee-certifications/${id}/reject/`, { reason: 'Rejected by manager' });
      fetchEmployeeCerts();
      toast.success("Certification rejected.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reject");
    }
  };

  return (
    <div className={employeeId ? "embedded-view" : "directory-container"}>
      {!employeeId && (
        <div className="directory-header">
          <div className="directory-title">
            <h2>{isManagerOrAdmin ? 'Organization Certifications' : 'My Certifications'}</h2>
            <p>{isManagerOrAdmin ? 'Review and verify employee certifications' : 'Manage and verify professional certifications'}</p>
          </div>
          <div className="directory-actions">
            <button className="btn-primary flex-center" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} style={{marginRight: '8px'}} /> Log Certification
            </button>
          </div>
        </div>
      )}
      
      {(!employeeId && !isManagerOrAdmin) ? (
        <div className="cert-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {employeeCerts.map(c => {
            // Mock a rating based on ID for visual flair
            const ratingScore = (4.0 + ((c.id % 10) / 10)).toFixed(1);
            return (
              <div key={c.id} className="cert-card-view" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>{c.certification_name || 'Unknown'}</h3>
                  <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
                    {'★'.repeat(Math.round(ratingScore))}{'☆'.repeat(5 - Math.round(ratingScore))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>{ratingScore}</span>
                  </div>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong>Issued:</strong> {c.issue_date}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                    backgroundColor: c.verification_status === 'verified' ? 'rgba(40, 167, 69, 0.1)' : 
                                     c.verification_status === 'rejected' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(246, 139, 31, 0.1)',
                    color: c.verification_status === 'verified' ? '#10b981' : 
                           c.verification_status === 'rejected' ? '#ef4444' : 'var(--accent-orange)'
                  }}>
                    {c.verification_status ? c.verification_status.toUpperCase() : 'PENDING'}
                  </span>
                  
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                    backgroundColor: c.status === 'active' ? 'rgba(40, 167, 69, 0.1)' : 
                                     c.status === 'expiring_soon' ? 'rgba(246, 139, 31, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                    color: c.status === 'active' ? '#10b981' : 
                           c.status === 'expiring_soon' ? 'var(--accent-orange)' : '#ef4444'
                  }}>
                    {c.status ? c.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}
                  </span>
                </div>

                {c.document && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <a href={c.document} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-orange)', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            );
          })}
          {employeeCerts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No certifications logged yet.
            </div>
          )}
        </div>
      ) : (
        <div className="directory-table-container">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Certification</th>
                <th>Issue Date</th>
                <th>Verification</th>
                <th>Validity</th>
                <th>Document</th>
                {isManagerOrAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employeeCerts.map(c => (
                <tr key={c.id}>
                  <td>{c.employee_name || 'Me'}</td>
                  <td><strong>{c.certification_name || 'Unknown'}</strong></td>
                  <td>{c.issue_date}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                      backgroundColor: c.verification_status === 'verified' ? 'rgba(40, 167, 69, 0.2)' : 
                                      c.verification_status === 'rejected' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(246, 139, 31, 0.2)',
                      color: c.verification_status === 'verified' ? '#4ade80' : 
                            c.verification_status === 'rejected' ? '#f87171' : 'var(--accent-orange)'
                    }}>
                      {c.verification_status ? c.verification_status.toUpperCase() : 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                      backgroundColor: c.status === 'active' ? 'rgba(40, 167, 69, 0.2)' : 
                                      c.status === 'expiring_soon' ? 'rgba(246, 139, 31, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                      color: c.status === 'active' ? '#4ade80' : 
                            c.status === 'expiring_soon' ? 'var(--accent-orange)' : '#f87171'
                    }}>
                      {c.status ? c.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>
                  <td>
                    {c.document ? (
                      <a href={c.document} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-orange)', textDecoration: 'underline' }}>View File</a>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: '0.85rem' }}>No file</span>
                    )}
                  </td>
                  {isManagerOrAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(c.verification_status === 'pending' || c.verification_status === 'rejected') && (
                          <button className="icon-btn-small" style={{ color: '#4ade80' }} onClick={() => handleVerify(c.id)} title="Approve">
                            <Check size={16} />
                          </button>
                        )}
                        {(c.verification_status === 'pending' || c.verification_status === 'verified') && (
                          <button className="icon-btn-small" style={{ color: '#f87171' }} onClick={() => handleReject(c.id)} title="Reject">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {employeeCerts.length === 0 && (
                <tr><td colSpan={isManagerOrAdmin ? "7" : "6"} style={{textAlign: 'center', padding: '20px'}}>No certifications logged.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Certification">
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Certification Type</label>
            <select required value={formData.certification_id} onChange={e => setFormData({...formData, certification_id: e.target.value})}>
              <option value="">Select a Certification...</option>
              {globalCerts.map(gc => (
                <option key={gc.id} value={gc.id}>{gc.name} ({gc.issuing_body})</option>
              ))}
              <option value="custom">Other (Specify below)</option>
            </select>
          </div>
          {formData.certification_id === 'custom' && (
            <div className="form-group">
              <label>Custom Certification Name</label>
              <input type="text" required value={formData.custom_certification_name} onChange={e => setFormData({...formData, custom_certification_name: e.target.value})} placeholder="e.g. AWS Certified DevOps Engineer" />
            </div>
          )}
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" required value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Expiry Date (Optional)</label>
            <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Credential ID (Optional)</label>
            <input type="text" value={formData.credential_id} onChange={e => setFormData({...formData, credential_id: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Upload Certificate (PDF/Image)</label>
            <div style={{ border: '1px dashed var(--border-light)', padding: '20px', borderRadius: '8px', background: 'var(--bg-dark)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <input 
                type="file" 
                onChange={e => {
                  setFormData({...formData, document: e.target.files[0]});
                  setUploadStatus('idle');
                  setUploadProgress(0);
                }} 
                accept=".pdf,image/*" 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer' }}
                disabled={uploadStatus === 'uploading'}
              />
              
              {uploadStatus === 'idle' && (
                <div style={{ color: 'var(--text-muted)' }}>
                  {formData.document ? (
                    <span><strong>{formData.document.name}</strong> (Ready to submit)</span>
                  ) : (
                    <span>Click or drag file to upload</span>
                  )}
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div style={{ color: 'var(--accent-orange)' }}>
                  <div style={{ marginBottom: '10px', fontWeight: '500' }}>Uploading {formData.document?.name}... {uploadProgress}%</div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--card-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.2s ease-out' }}></div>
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={20} /> <strong>{formData.document?.name}</strong> uploaded!
                </div>
              )}

              {uploadStatus === 'error' && (
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <X size={20} /> Upload failed. Please try again.
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => {
              setIsModalOpen(false);
              setFormData({ certification_id: '', custom_certification_name: '', issue_date: '', expiry_date: '', credential_id: '', document: null });
              setUploadStatus('idle');
              setUploadProgress(0);
            }} disabled={uploadStatus === 'uploading'}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={uploadStatus === 'uploading'}>
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Certifications;
