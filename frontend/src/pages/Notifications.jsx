import React from 'react';
import './EmployeeDirectory.css';

const Notifications = () => {
  return (
    <div className="directory-container">
      <div className="directory-header">
        <div className="directory-title">
          <h2>Notifications</h2>
        </div>
      </div>
      <div className="directory-table-container" style={{ padding: '40px', textAlign: 'center' }}>
        <p>No new notifications.</p>
      </div>
    </div>
  );
};
export default Notifications;
