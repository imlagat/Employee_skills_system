import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import './Landing.css';

const Terms = () => {
  return (
    <div className="landing-wrapper" style={{ padding: '80px 0' }}>
      <div className="landing-container" style={{ maxWidth: '800px', background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', padding: '40px', marginTop: '40px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange, #f68b1f)', textDecoration: 'none', marginBottom: '24px', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={32} color="var(--accent-orange, #f68b1f)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Terms & Conditions</h1>
        </div>
        
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>Last Updated: July 28, 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.6', color: 'var(--landing-text-muted)' }}>
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>1. Terms of Use</h3>
            <p>By accessing SkillMatrix, you agree to comply with and be bound by these terms. The system is designed for professional skills tracking, certification management, and internal staffing allocations.</p>
          </section>
          
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>2. Account Verification</h3>
            <p>Users who register via the email invitation link must provide accurate and verifiable information. Sharing credentials or impersonating other employees is strictly prohibited.</p>
          </section>
          
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>3. Service Availability</h3>
            <p>We make reasonable efforts to ensure portal uptime and system backups, but we are not liable for any service interruptions, data synchronization delays, or API outages.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
