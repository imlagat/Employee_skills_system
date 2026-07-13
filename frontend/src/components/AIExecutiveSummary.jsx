import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';
import api from '../api/axios';

const AIExecutiveSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/insights/dashboard/');
        setSummary(res.data.summary);
      } catch (err) {
        console.error("Failed to fetch AI summary", err);
        setSummary("Unable to load AI executive summary at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="ai-insight-card loading" style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '8px' }}>
          <BrainCircuit size={20} className="spinning" />
          <strong style={{ fontSize: '1rem' }}>AI Executive Summary</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Analyzing organizational metrics...</p>
      </div>
    );
  }

  return (
    <div className="ai-insight-card" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#3b82f6' }}>
        <BrainCircuit size={24} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>AI Executive Summary</h3>
      </div>
      <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: 0, fontSize: '1.05rem' }}>
        {summary}
      </p>
    </div>
  );
};

export default AIExecutiveSummary;
