import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Network, Plus, Trash2, Edit, User, UserCheck, ShieldAlert, Award, Compass, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import './EmployeeDirectory.css';

const Succession = () => {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    target_role: '',
    department: '',
    candidate: '',
    incumbent: '',
    readiness: 'ready_now',
    required_skills: [],
    notes: ''
  });

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [plansRes, empRes, deptRes, skillsRes] = await Promise.all([
        api.get('/plans/'),
        api.get('/employees/'),
        api.get('/departments/'),
        api.get('/skills/')
      ]);
      setPlans(plansRes.data.results || plansRes.data || []);
      setEmployees(empRes.data.results || empRes.data || []);
      setDepartments(deptRes.data.results || deptRes.data || []);
      setSkillsList(skillsRes.data.results || skillsRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load succession planning data.");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.user?.first_name} ${emp.user?.last_name}` : 'Unknown';
  };

  const getDeptName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'N/A';
  };

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      target_role: '',
      department: '',
      candidate: '',
      incumbent: '',
      readiness: 'ready_now',
      required_skills: [],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      target_role: plan.target_role,
      department: plan.department || '',
      candidate: plan.candidate,
      incumbent: plan.incumbent || '',
      readiness: plan.readiness,
      required_skills: plan.required_skills || [],
      notes: plan.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.target_role || !formData.candidate) {
      toast.error("Please fill in the target role and candidate fields.");
      return;
    }

    try {
      const payload = {
        target_role: formData.target_role,
        readiness: formData.readiness,
        candidate: parseInt(formData.candidate),
        department: formData.department ? parseInt(formData.department) : null,
        incumbent: formData.incumbent ? parseInt(formData.incumbent) : null,
        required_skills: formData.required_skills.map(id => parseInt(id)),
        notes: formData.notes
      };

      if (editingPlanId) {
        await api.patch(`/plans/${editingPlanId}/`, payload);
        toast.success("Succession plan updated successfully!");
      } else {
        await api.post('/plans/', payload);
        toast.success("Succession plan created successfully!");
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save succession plan.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this succession plan?")) {
      try {
        await api.delete(`/plans/${id}/`);
        toast.success("Succession plan deleted.");
        fetchInitialData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete plan.");
      }
    }
  };

  const getReadinessBadge = (readiness) => {
    switch (readiness) {
      case 'ready_now':
        return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Ready Now</span>;
      case '1_year':
        return <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>1 Year</span>;
      case '2_years':
        return <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>2+ Years</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading-state" style={{ padding: '40px' }}>Loading Succession Plans...</div>;
  }

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Network size={28} color="#3b82f6" /> Succession Planning</h2>
          <p>Chart future leadership pathways and identify candidate readiness for critical roles.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isManagerOrAdmin && (
            <button className="btn-primary flex-center" onClick={handleOpenAddModal}>
              <Plus size={18} style={{ marginRight: '8px' }} /> Add Succession Plan
            </button>
          )}
          <button className="icon-btn-small" onClick={fetchInitialData} title="Refresh details" style={{ padding: '10px' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: 'var(--card-bg)', 
          border: '1px solid var(--border-light)', 
          borderRadius: '16px', 
          marginTop: '20px',
          color: 'var(--text-muted)'
        }}>
          <ShieldAlert size={48} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
          <h3>No Succession Plans Defined</h3>
          <p>Start mapping successor candidates for critical organization roles.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginTop: '20px' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-light)', 
              borderRadius: '16px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '15px',
              position: 'relative'
            }}>
              {/* Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{plan.target_role}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getDeptName(plan.department)} Department</span>
                  </div>
                  {getReadinessBadge(plan.readiness)}
                </div>

                {/* Incumbent & Successor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', background: 'var(--bg-dark)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <User size={16} color="var(--text-muted)" />
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>INCUMBENT</span>
                      <strong style={{ color: 'var(--text-main)' }}>{plan.incumbent ? getEmployeeName(plan.incumbent) : 'Vacant'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                    <UserCheck size={16} color="#10b981" />
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PROPOSED SUCCESSOR</span>
                      <strong style={{ color: 'var(--text-main)' }}>{plan.candidate_name || getEmployeeName(plan.candidate)}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{plan.candidate_job_title || 'Employee'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {plan.notes && (
                  <div style={{ marginTop: '15px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>DEVELOPMENT ROADMAP / NOTES</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{plan.notes}</p>
                  </div>
                )}

                {/* Required Skills */}
                {plan.required_skills && plan.required_skills.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>REQUIRED SKILLS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {plan.required_skills.map(skillId => {
                        const skillObj = skillsList.find(s => s.id === skillId);
                        return skillObj ? (
                          <span key={skillId} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                            {skillObj.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {isManagerOrAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <button className="icon-btn-small" onClick={() => handleOpenEditModal(plan)} title="Edit plan">
                    <Edit size={14} />
                  </button>
                  <button className="icon-btn-small" style={{ color: '#ef4444' }} onClick={() => handleDelete(plan.id)} title="Delete plan">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlanId ? "Edit Succession Plan" : "Create Succession Plan"}>
        <form onSubmit={handleSave} className="employee-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Target Role / Position Name</label>
              <input 
                type="text" 
                placeholder="e.g. Director of Product"
                value={formData.target_role}
                onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Current Incumbent (Optional)</label>
              <select 
                value={formData.incumbent}
                onChange={e => setFormData({ ...formData, incumbent: e.target.value })}
              >
                <option value="">Select Incumbent (or Vacant)</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Proposed Successor Candidate</label>
              <select 
                value={formData.candidate}
                onChange={e => setFormData({ ...formData, candidate: e.target.value })}
                required
              >
                <option value="">Select Successor Candidate</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name} ({e.job_title || 'Employee'})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Estimated Readiness</label>
              <select 
                value={formData.readiness}
                onChange={e => setFormData({ ...formData, readiness: e.target.value })}
              >
                <option value="ready_now">Ready Now</option>
                <option value="1_year">1 Year</option>
                <option value="2_years">2+ Years</option>
              </select>
            </div>

            <div className="form-group">
              <label>Required Competencies (Skills)</label>
              <select 
                multiple
                value={formData.required_skills}
                onChange={e => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, required_skills: values });
                }}
                style={{ height: '80px', padding: '8px' }}
              >
                {skillsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Hold Cmd (Mac) or Ctrl (Windows) to pick multiple.</span>
            </div>
          </div>

          <div className="form-group">
            <label>Development Plan Notes</label>
            <textarea 
              rows="3" 
              placeholder="Detail required courses, timeline gaps, or general promotion notes..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save succession plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Succession;
