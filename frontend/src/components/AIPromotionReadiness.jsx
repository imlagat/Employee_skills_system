import React, { useState, useEffect } from 'react';
import { TrendingUp, BrainCircuit } from 'lucide-react';
import api from '../api/axios';

const AIPromotionReadiness = ({ employeeId }) => {
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
      const res = await api.get(`/ai/employees/${employeeId}/recommendations/`);
      setAnalysis(res.data);
    } catch (err) {
      console.error("AI Promotion Analysis failed", err);
      setError("Failed to load AI Promotion Analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-insight-card loading" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.05)' }}>
        <BrainCircuit size={24} className="spinning" style={{ color: '#a855f7', marginBottom: '10px' }} />
        <p style={{ color: '#94a3b8' }}>AI is evaluating promotion readiness...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <div className="ai-insight-card" style={{ padding: '24px', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#a855f7' }}>
        <TrendingUp size={20} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>AI Promotion Readiness</h3>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analysis.promotion_score >= 80 ? '#4ade80' : analysis.promotion_score >= 50 ? '#f68b1f' : '#f87171' }}>
            {analysis.promotion_score}%
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Readiness Score</p>
        </div>

        <div style={{ flex: '2', minWidth: '250px' }}>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            {analysis.reason}
          </p>
          
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
            <strong style={{ color: '#a855f7', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>RECOMMENDED NEXT STEP</strong>
            <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{analysis.recommended_next_step}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromotionReadiness;
