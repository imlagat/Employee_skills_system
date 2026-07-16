import React, { useState, useEffect } from 'react';
import { BrainCircuit, Check, Copy, Printer, X, Download } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from './Modal';

const AIAdvisorModal = ({ isOpen, onClose, employeeId, employeeName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      generatePlan();
    }
  }, [isOpen, employeeId]);

  const generatePlan = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/employees/${employeeId}/gap-analysis/`);
      setAnalysis(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate AI development plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!analysis) return;
    const text = `
AI Career Development Plan: ${employeeName}
Readiness Score: ${analysis.readiness}%

Recommendation:
${analysis.recommendation}

Strengths:
${analysis.strengths ? analysis.strengths.map(s => `- ${s}`).join('\n') : 'None'}

Identified Gaps:
${analysis.missing ? analysis.missing.map(m => `- ${m}`).join('\n') : 'None'}
    `;
    navigator.clipboard.writeText(text);
    toast.success("Development plan copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Career Development Advisor">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '15px' }}>
          <BrainCircuit size={40} className="spinning" style={{ color: 'var(--accent-orange)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Gemini is synthesizing career roadmap & skill gaps...</p>
        </div>
      ) : analysis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(246, 139, 31, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(246, 139, 31, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
              {analysis.readiness}%
            </div>
            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', marginTop: '4px' }}>
              Target Role Readiness Score
            </div>
          </div>

          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <BrainCircuit size={16} color="var(--accent-orange)" /> AI Executive Summary
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {analysis.recommendation}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold' }}>STRENGTHS</h4>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li>No significant strengths logged.</li>
                )}
              </ul>
            </div>

            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>IDENTIFIED GAPS</h4>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {analysis.missing && analysis.missing.length > 0 ? (
                  analysis.missing.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li>No competency gaps found.</li>
                )}
              </ul>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px', 
            marginTop: '10px', 
            paddingTop: '15px', 
            borderTop: '1px solid var(--border-light)' 
          }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }} onClick={handleCopyToClipboard}>
              <Copy size={16} /> Copy
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }} onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Failed to generate advisor insights.</div>
      )}
    </Modal>
  );
};

export default AIAdvisorModal;
