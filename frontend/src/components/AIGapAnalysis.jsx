import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import api from '../api/axios';

const AIGapAnalysis = ({ employeeId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeId) {
      fetchAnalysis();
    }
  }, [employeeId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/employees/${employeeId}/gap-analysis/`);
      setAnalysis(res.data);
    } catch (err) {
      console.error("AI Analysis failed", err);
      setError("Failed to load AI Gap Analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-insight-card loading" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.05)' }}>
        <BrainCircuit size={24} className="spinning" style={{ color: '#3b82f6', marginBottom: '10px' }} />
        <p style={{ color: '#94a3b8' }}>AI is analyzing competency gaps...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <div className="ai-insight-card" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#3b82f6' }}>
        <BrainCircuit size={20} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>AI Competency Analysis</h3>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analysis.readiness >= 80 ? '#4ade80' : analysis.readiness >= 50 ? '#f68b1f' : '#f87171' }}>
            {analysis.readiness}%
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Position Readiness</p>
        </div>

        <div style={{ flex: '2', minWidth: '250px' }}>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            {analysis.recommendation}
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <strong style={{ color: '#4ade80', fontSize: '0.85rem' }}>STRENGTHS</strong>
                <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            
            {analysis.missing && analysis.missing.length > 0 && (
              <div>
                <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>MISSING SKILLS</strong>
                <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {analysis.missing.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGapAnalysis;
