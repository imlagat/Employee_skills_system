import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Building, BookOpen, Award, TrendingUp, BarChart2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
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

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="report-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
          <div className="panel-header" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><TrendingUp size={18} color="var(--accent-orange)" /> Top Skills (By Avg Proficiency)</h3>
          </div>
          <div className="panel-content">
            {skillStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No skill data available.</div>
            ) : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <BarChart data={skillStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="skill__name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 5]} tickCount={6} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                    <Bar dataKey="avg_proficiency" name="Avg Proficiency" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {skillStats.map((entry, index) => {
                        const COLORS = ['#3b82f6', '#10b981', '#4f46e5', '#0d9488', '#8b5cf6', '#334155'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="report-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
          <div className="panel-header" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><BarChart2 size={18} color="var(--accent-orange)" /> Certification Distribution</h3>
          </div>
          <div className="panel-content">
            {certStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No certification data available.</div>
            ) : (
              <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={certStats}
                      dataKey="count"
                      nameKey="certification__name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.slice(0, 15)}... (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {certStats.map((entry, index) => {
                        const COLORS = ['#3b82f6', '#10b981', '#4f46e5', '#0d9488', '#8b5cf6', '#334155'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
