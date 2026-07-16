import React, { useState, useEffect } from 'react';
import { Bell, Check, BookOpen, AlertCircle, CheckCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css'; // Reuses page layouts

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      toast.success("Notification marked as read.");
      fetchNotifications();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    
    try {
      await Promise.all(unread.map(n => api.post(`/notifications/${n.id}/mark_read/`)));
      toast.success("All notifications marked as read.");
      fetchNotifications();
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark all as read.");
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'cert_expiry':
      case 'training_required':
        return <BookOpen size={20} style={{ color: 'var(--accent-orange)' }} />;
      case 'skill_gap':
        return <AlertCircle size={20} style={{ color: '#f87171' }} />;
      default:
        return <Bell size={20} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div className="directory-container">
      <div className="directory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="directory-title">
          <h2>Notifications</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Stay updated with training suggestions, skill gaps, and system events.
          </p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="directory-table-container" style={{ marginTop: '20px', background: 'transparent', boxShadow: 'none' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={40} style={{ margin: '0 auto 15px auto', opacity: 0.5, display: 'block' }} />
            No notifications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  background: 'var(--card-bg)', 
                  border: '1px solid var(--border-light)', 
                  borderLeft: n.is_read ? '1px solid var(--border-light)' : '4px solid var(--accent-orange)', 
                  borderRadius: '12px', 
                  padding: '16px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  gap: '15px', 
                  boxShadow: n.is_read ? 'none' : '0 4px 15px rgba(0,0,0,0.05)',
                  opacity: n.is_read ? 0.75 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-dark)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    flexShrink: 0
                  }}>
                    {getNotifIcon(n.notif_type)}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-main)', margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: n.is_read ? 'normal' : '600' }}>
                      {n.message}
                    </p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button 
                    className="icon-btn-small" 
                    style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '6px' }} 
                    onClick={() => handleMarkRead(n.id)} 
                    title="Mark as Read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
