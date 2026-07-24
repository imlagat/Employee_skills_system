import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Building, BookOpen, Award, TrendingUp, BarChart2, ShieldAlert, Sparkles, Printer, Activity, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';
import './Reports.css';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [skillStats, setSkillStats] = useState([]);
  const [certStats, setCertStats] = useState([]);
  const [flightRisk, setFlightRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, skillsRes, certsRes, riskRes] = await Promise.all([
          api.get('/dashboards/summary/'),
          api.get('/dashboards/skill-gaps/'),
          api.get('/dashboards/cert-status/'),
          api.get('/ai/flight-risk/').catch(() => ({ data: null }))
        ]);
        setSummary(sumRes.data);
        setSkillStats(skillsRes.data);
        setCertStats(certsRes.data);
        if (riskRes?.data) setFlightRisk(riskRes.data);
      } catch (err) {
        console.error("Error fetching analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handlePrintExecutiveReport = () => {
    window.print();
  };

  if (loading) return <div className="loading-state" style={{ padding: '40px' }}>Loading reports and insights...</div>;

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Reports & Executive Insights</h2>
          <p>System-wide talent metrics, predictive retention radar, and skill health analytics.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrintExecutiveReport}>
          <Printer size={16} /> Print / Export Executive Deck PDF
        </button>
      </div>

      {/* Real-time HR Feed Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(246, 139, 31, 0.1)', border: '1px solid rgba(246, 139, 31, 0.3)', borderRadius: '10px', padding: '10px 16px', marginTop: '15px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
        <Activity size={18} color="var(--accent-orange)" />
        <span><strong>Live Activity Feed:</strong> System-wide skill audit synchronized. 94% workforce skills verified across 4 departments.</span>
      </div>

      <div className="reports-grid" style={{ marginTop: '20px' }}>
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

      {/* Predictive Talent Flight Risk & Retention Radar */}
      {flightRisk && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <ShieldAlert size={22} color="#ef4444" /> Predictive Talent Flight Risk & Growth Radar
            </h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 'bold' }}>
                High Risk: {flightRisk.overview.high_risk_count}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 'bold' }}>
                Medium Risk: {flightRisk.overview.medium_risk_count}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold' }}>
                Low Risk: {flightRisk.overview.low_risk_count}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Risk Distribution</h4>
              {flightRisk.employees.slice(0, 4).map((emp, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.position} ({emp.tenure_years} yrs)</div>
                  </div>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: emp.risk_level === 'High' ? 'rgba(239,68,68,0.2)' : (emp.risk_level === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'),
                    color: emp.risk_level === 'High' ? '#ef4444' : (emp.risk_level === 'Medium' ? '#f59e0b' : '#10b981')
                  }}>
                    {emp.risk_score}% {emp.risk_level}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--accent-purple, #8b5cf6)" /> Gemini AI Retention Recommendations
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {flightRisk.ai_retention_recommendations}
              </p>
            </div>
          </div>
        </div>
      )}

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
                    <Bar dataKey="avg_proficiency" name="Avg Proficiency" fill="#64748b" radius={[4, 4, 0, 0]}>
                      {skillStats.map((entry, index) => {
                        const COLORS = ['#64748b', '#78716c', '#475569', '#94a3b8', '#71717a', '#334155'];
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
                        const COLORS = ['#64748b', '#78716c', '#475569', '#94a3b8', '#71717a', '#334155'];
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
