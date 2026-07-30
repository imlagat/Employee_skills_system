import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare, Mail, Link as LinkIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

const ShareInviteModal = ({ isOpen, onClose, invite }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!invite) return null;

  const origin = window.location.origin;
  const inviteUrl = `${origin}/accept-invite/${invite.token}`;
  const shareText = `Hi! You have been invited to join the SkillMatrix system as a ${invite.role || 'team member'}.\n\nInvitation Code: ${invite.token}\n\nClick the link below to accept your invitation & set up your profile:\n${inviteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    toast.success('Full invitation message copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkillMatrix Invitation',
          text: `Join SkillMatrix as a ${invite.role || 'team member'}`,
          url: inviteUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const mailtoUrl = `mailto:${invite.email}?subject=${encodeURIComponent('Invitation to join SkillMatrix')}&body=${encodeURIComponent(shareText)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Invitation Link">
      <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
        
        {/* Recipient Header Info */}
        <div style={{ 
          background: 'rgba(246, 139, 31, 0.12)', 
          border: '1px solid rgba(246, 139, 31, 0.3)', 
          borderRadius: '10px', 
          padding: '14px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Invited Recipient</div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)', marginTop: '2px' }}>{invite.email}</div>
          </div>
          <span style={{ 
            fontSize: '0.78rem', 
            background: 'rgba(255,255,255,0.08)', 
            padding: '4px 10px', 
            borderRadius: '12px', 
            fontWeight: 'bold',
            textTransform: 'capitalize' 
          }}>
            Role: {invite.role}
          </span>
        </div>

        {/* Direct Link Input with Copy Button */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Direct Invitation URL</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              readOnly 
              value={inviteUrl}
              style={{ 
                flex: 1, 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-light)', 
                background: 'var(--bg-dark)', 
                color: 'var(--text-main)', 
                fontSize: '0.85rem',
                fontFamily: 'monospace'
              }}
            />
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleCopyLink}
              style={{ height: '40px', padding: '0 16px', fontSize: '0.85rem' }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sharing Options Grid */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>Sharing Options</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            
            {/* Native Share */}
            {navigator.share && (
              <button 
                type="button"
                onClick={handleNativeShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Share2 size={16} color="var(--accent-orange, #f68b1f)" /> Native Share
              </button>
            )}

            {/* WhatsApp */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                background: 'rgba(37, 211, 102, 0.1)',
                color: '#25d366',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <MessageSquare size={16} /> WhatsApp
            </a>

            {/* Email App */}
            <a 
              href={mailtoUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                background: 'rgba(96, 165, 250, 0.1)',
                color: '#60a5fa',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <Mail size={16} /> Email App
            </a>

            {/* Open Link */}
            <a 
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} color="var(--accent-orange, #f68b1f)" /> Open Link
            </a>

          </div>
        </div>

        {/* Message Text Preview Box */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>Preformatted Message Preview</label>
            <button 
              type="button" 
              onClick={handleCopyText}
              style={{ background: 'none', border: 'none', color: 'var(--accent-orange, #f68b1f)', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedText ? <Check size={14} /> : <Copy size={14} />} {copiedText ? 'Copied Full Text' : 'Copy Full Text'}
            </button>
          </div>
          <textarea 
            readOnly 
            rows="4" 
            value={shareText}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-light)', 
              background: 'var(--bg-dark)', 
              color: 'var(--text-muted)', 
              fontSize: '0.825rem',
              resize: 'none',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn-outline" 
            onClick={onClose}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default ShareInviteModal;
