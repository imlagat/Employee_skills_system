import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import './Landing.css';

const PrivacyPolicy = () => {
  return (
    <div className="landing-wrapper" style={{ padding: '80px 0' }}>
      <div className="landing-container" style={{ maxWidth: '800px', background: 'var(--landing-card)', border: '1px solid var(--landing-border)', borderRadius: '16px', padding: '40px', marginTop: '40px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange, #f68b1f)', textDecoration: 'none', marginBottom: '24px', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Shield size={32} color="var(--accent-orange, #f68b1f)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Privacy Policy</h1>
        </div>
        
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>Last Updated: July 28, 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.6', color: 'var(--landing-text-muted)' }}>
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>1. Information We Collect</h3>
            <p>We collect information you provide directly to us when creating an account, editing your profile, uploading files (such as resumes), or submitting support requests. This may include your name, email, phone number, work experience, skills, and credentials.</p>
          </section>
          
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>2. How We Use Your Information</h3>
            <p>We use the collected data to verify and display qualifications, map organizational competency matrices, auto-populate profile fields via Gemini AI parsing, send notification alerts (such as expiring certifications), and maintain secure portal access.</p>
          </section>
          
          <section>
            <h3 style={{ color: 'var(--landing-text-main)', marginBottom: '10px' }}>3. Data Protection</h3>
            <p>We implement secure hashing for credentials and enforce strict role-based authorization to protect your records from unauthorized changes or exposure.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
