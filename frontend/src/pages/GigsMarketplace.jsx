import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Briefcase, Plus, CheckCircle, Users, Clock, Filter, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const GigsMarketplace = () => {
  const [gigs, setGigs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gig_type: 'micro_project',
    estimated_hours: 10,
    required_skills: []
  });

  useEffect(() => {
    fetchGigs();
    fetchSkills();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gigs/');
      setGigs(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load gigs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills/');
      setSkills(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async (gigId) => {
    try {
      await api.post(`/gigs/${gigId}/apply/`);
      toast.success('Successfully applied / claimed gig!');
      fetchGigs();
    } catch (e) {
      console.error(e);
      toast.error('Could not claim gig.');
    }
  };

  const handleComplete = async (gigId) => {
    try {
      await api.post(`/gigs/${gigId}/complete/`);
      toast.success('Gig marked as completed!');
      fetchGigs();
    } catch (e) {
      console.error(e);
      toast.error('Could not update gig.');
    }
  };

  const handleCreateGig = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please enter title and description.');
      return;
    }
    try {
      await api.post('/gigs/', formData);
      toast.success('Internal gig posted!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', gig_type: 'micro_project', estimated_hours: 10, required_skills: [] });
      fetchGigs();
    } catch (e) {
      console.error(e);
      toast.error('Failed to create gig.');
    }
  };

  const filteredGigs = gigs.filter(g => typeFilter === '' || g.gig_type === typeFilter);

  const getBadgeColor = (type) => {
    switch (type) {
      case 'mentorship': return 'rgba(168, 85, 247, 0.2)';
      case 'cross_functional': return 'rgba(59, 130, 246, 0.2)';
      default: return 'rgba(16, 185, 129, 0.2)';
    }
  };

  const getBadgeText = (type) => {
    switch (type) {
      case 'mentorship': return '#c084fc';
      case 'cross_functional': return '#60a5fa';
      default: return '#34d399';
    }
  };

  if (loading) {
    return <div className="loading-state" style={{ padding: '40px' }}>Loading Gig Marketplace...</div>;
  }

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={28} color="var(--accent-orange)" /> Internal Gig & Mentorship Marketplace
          </h2>
          <p>Gain hands-on skills through micro-projects, cross-functional tasks, and peer mentorships.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} /> Post Internal Gig
        </button>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: '15px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', padding: '16px', borderRadius: '12px', marginTop: '20px', alignItems: 'center' }}>
        <Filter size={18} color="var(--text-muted)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by Type:</span>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <option value="">All Gig Types</option>
          <option value="micro_project">Micro Projects</option>
          <option value="mentorship">Peer Mentorship</option>
          <option value="cross_functional">Cross-Functional Task</option>
        </select>
      </div>

      {/* Grid of Gigs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {filteredGigs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <AlertCircle size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No internal gigs found. Post one to collaborate with peers!</p>
          </div>
        ) : (
          filteredGigs.map(g => (
            <div key={g.id} style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-light)', 
              borderRadius: '12px', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justify: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    background: getBadgeColor(g.gig_type), 
                    color: getBadgeText(g.gig_type) 
                  }}>
                    {g.gig_type_display || g.gig_type}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {g.estimated_hours} hrs
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: 'var(--text-main)' }}>{g.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>{g.description}</p>

                {g.required_skill_names && g.required_skill_names.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {g.required_skill_names.map((sk, idx) => (
                      <span key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', pt: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  By: <strong>{g.created_by_name || 'HR Team'}</strong>
                </div>

                {g.status === 'open' ? (
                  <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleApply(g.id)}>
                    Claim / Join
                  </button>
                ) : g.status === 'in_progress' ? (
                  <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--accent-green)' }} onClick={() => handleComplete(g.id)}>
                    Mark Done
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Gig Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Post Internal Gig or Mentorship</h3>
            <form onSubmit={handleCreateGig}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Gig Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Refactor API Endpoints / Python Mentor"
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Gig Type</label>
                <select 
                  value={formData.gig_type}
                  onChange={(e) => setFormData({...formData, gig_type: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                >
                  <option value="micro_project">Micro Project</option>
                  <option value="mentorship">Peer Mentorship</option>
                  <option value="cross_functional">Cross-Functional Task</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the tasks, goals, and target outcomes..."
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Estimated Time (Hours)</label>
                <input 
                  type="number" 
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({...formData, estimated_hours: parseInt(e.target.value) || 1})}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigsMarketplace;
