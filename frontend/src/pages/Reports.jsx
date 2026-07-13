import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Building, BookOpen, Award, TrendingUp, BarChart2 } from 'lucide-react';
import './EmployeeDirectory.css';
import './Reports.css';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [skillStats, setSkillStats] = useState([]);
  const [certStats, setCertStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, skillsRes, certsRes] = await Promise.all([
          api.get('/dashboards/summary/'),
          api.get('/dashboards/skill-gaps/'),
          api.get('/dashboards/cert-status/')
        ]);
        setSummary(sumRes.data);
        setSkillStats(skillsRes.data);
        setCertStats(certsRes.data);
      } catch (err) {
        console.error("Error fetching analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-state" style={{ padding: '40px' }}>Loading reports and insights...</div>;

  return (
    <div className="directory-page">
      <div className="page-header">
        <div>
          <h2>Reports & Insights</h2>
          <p>System-wide analytics and performance metrics</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><Users size={24} color="#f68b1f" /></div>
          <div className="kpi-info">
            <h3>{summary?.total_employees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Building size={24} color="#f68b1f" /></div>
          <div className="kpi-info">
            <h3>{summary?.total_departments || 0}</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><BookOpen size={24} color="#f68b1f" /></div>
          <div className="kpi-info">
            <h3>{summary?.total_skills || 0}</h3>
            <p>Skills Tracked</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Award size={24} color="#f68b1f" /></div>
          <div className="kpi-info">
            <h3>{summary?.total_certifications || 0}</h3>
            <p>Active Certs</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="report-panel">
          <div className="panel-header">
            <h3><TrendingUp size={18} style={{marginRight: '8px'}} /> Top Skills (By Avg Proficiency)</h3>
          </div>
          <div className="panel-content">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Avg Proficiency</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {skillStats.map((stat, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '500' }}>{stat.skill__name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px' }}>
                          <div style={{ width: `${(stat.avg_proficiency / 5) * 100}%`, background: '#f59e0b', height: '100%', borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{Number(stat.avg_proficiency).toFixed(1)}/5</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{stat.employee_count}</td>
                  </tr>
                ))}
                {skillStats.length === 0 && (
                  <tr><td colSpan="3" className="empty-state">No skill data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-panel">
          <div className="panel-header">
            <h3><BarChart2 size={18} style={{marginRight: '8px'}} /> Certification Distribution</h3>
          </div>
          <div className="panel-content">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Holders</th>
                </tr>
              </thead>
              <tbody>
                {certStats.map((cert, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '500' }}>{cert.certification__name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{cert.count}</td>
                  </tr>
                ))}
                {certStats.length === 0 && (
                  <tr><td colSpan="2" className="empty-state">No certification data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
