import React from 'react';
import { ShieldCheck, Lock, FileText, Check, X, Sparkles, HeartPulse, UserCheck } from 'lucide-react';
import Modal from './Modal';

const ConsentModal = ({ isOpen, onClose, onAccept }) => {
  const handleConfirm = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data Processing & Privacy Consent Agreement">
      <div style={{ padding: '4px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
        
        {/* Header Intro Banner */}
        <div style={{ 
          background: 'rgba(246, 139, 31, 0.12)', 
          border: '1px solid rgba(246, 139, 31, 0.3)', 
          borderRadius: '10px', 
          padding: '14px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldCheck size={28} color="var(--accent-orange, #f68b1f)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
              SkillMatrix Privacy & Data Protection Standard
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Please review how your data is collected, processed, and protected under global data protection regulations before proceeding.
            </p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div style={{ 
          maxHeight: '340px', 
          overflowY: 'auto', 
          padding: '16px', 
          background: 'var(--bg-dark)', 
          border: '1px solid var(--border-light)', 
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          {/* Section 1 */}
          <div>
            <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={16} color="var(--accent-orange, #f68b1f)" /> 1. Scope of Workforce Data Collection
            </h5>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              By creating a profile on SkillMatrix, you consent to the collection and processing of personal identification information (name, professional email address, job title, department, and phone number) and organizational data (skill matrix ratings, assessment scores, certifications, and training participation history).
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#60a5fa" /> 2. AI Analytics & Automated Career Coaching
            </h5>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              SkillMatrix integrates Google Gemini AI to evaluate organizational competency matrix data, identify skills gaps, and generate automated training recommendations. Your data is used strictly for internal talent mobility, career pathing, and professional development.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={16} color="#f87171" /> 3. Voluntary Medical Bio-Data & Emergency Contacts
            </h5>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              For workforce safety, employees may voluntarily provide emergency contact details (Next of Kin) and basic medical bio-data (blood group, allergies, chronic illnesses). This information is kept strictly confidential and accessible solely for emergency response situations.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#10b981" /> 4. Data Rights, Security & Audit Logging
            </h5>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Your consent timestamp and IP audit log are recorded for compliance verification. You maintain the right to inspect your logged records, update personal profile information, and request data deletion in accordance with company policy and data protection laws.
            </p>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-outline-dark" 
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Close Window
          </button>
          {onAccept && (
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleConfirm}
              style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} /> Accept & Confirm Terms
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default ConsentModal;
