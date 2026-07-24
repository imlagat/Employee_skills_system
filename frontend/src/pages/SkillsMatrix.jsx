import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { LayoutGrid, Download, Building, Search, Network, Sparkles, ShieldCheck, Users, CheckCircle, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const SkillsMatrix = () => {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'network'

  // Smart Team Finder State
  const [showTeamFinder, setShowTeamFinder] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [teamMatches, setTeamMatches] = useState(null);
  const [matcherLoading, setMatcherLoading] = useState(false);

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      const [empRes, skillRes, empSkillsRes, deptRes] = await Promise.all([
        api.get('/employees/'),
        api.get('/skills/'),
        api.get('/employee-skills/'),
        api.get('/departments/')
      ]);

      setEmployees(empRes.data.results || empRes.data || []);
      setSkills(skillRes.data.results || skillRes.data || []);
      setEmployeeSkills(empSkillsRes.data.results || empSkillsRes.data || []);
      setDepartments(deptRes.data.results || deptRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load skills matrix data.");
    } finally {
      setLoading(false);
    }
  };

  const getEmpSkill = (employeeId, skillId) => {
    return employeeSkills.find(item => item.employee === employeeId && item.skill === skillId);
  };

  const getProficiency = (employeeId, skillId) => {
    const es = getEmpSkill(employeeId, skillId);
    return es ? es.proficiency : 0;
  };

  const getCellColor = (level) => {
    switch (level) {
      case 1: return 'rgba(16, 185, 129, 0.15)';
      case 2: return 'rgba(16, 185, 129, 0.35)';
      case 3: return 'rgba(16, 185, 129, 0.55)';
      case 4: return 'rgba(16, 185, 129, 0.75)';
      case 5: return 'rgba(16, 185, 129, 0.95)';
      default: return 'var(--bg-dark)';
    }
  };

  const getCellTextColor = (level) => {
    return level > 0 ? '#ffffff' : 'var(--text-muted)';
  };

  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.user?.first_name} ${emp.user?.last_name}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptId === '' || emp.department?.id === parseInt(selectedDeptId);
    return matchesSearch && matchesDept;
  });

  const exportToCSV = () => {
    if (filteredEmployees.length === 0 || skills.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Employee ID", "Name", "Department", ...skills.map(s => s.name)];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    filteredEmployees.forEach(emp => {
      const row = [
        emp.employee_id,
        `${emp.user?.first_name} ${emp.user?.last_name}`,
        emp.department?.name || 'N/A',
        ...skills.map(s => getProficiency(emp.id, s.id))
      ];
      csvContent += row.map(r => `"${r}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Skills_Matrix_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Skills matrix exported successfully!");
  };

  const runSmartMatcher = async () => {
    if (selectedSkillIds.length === 0) {
      toast.error('Select at least one skill for team matching.');
      return;
    }
    try {
      setMatcherLoading(true);
      const res = await api.post('/skills/smart-team-matcher/', { skill_ids: selectedSkillIds });
      setTeamMatches(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to run team matcher.');
    } finally {
      setMatcherLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state" style={{ padding: '40px' }}>Loading Skills Matrix & Network...</div>;
  }

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutGrid size={28} color="var(--accent-orange)" /> Organizational Skills Matrix
          </h2>
          <p>Multi-dimensional competency matrix, network graph, and AI smart team staffing.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-purple, #8b5cf6)' }}
            onClick={() => setShowTeamFinder(true)}
          >
            <Sparkles size={16} /> Smart Team Finder
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={exportToCSV} disabled={filteredEmployees.length === 0}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Control bar with View Mode Switch & Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border-light)', 
        padding: '16px', 
        borderRadius: '12px', 
        marginTop: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justify: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '3px' }}>
            <button 
              onClick={() => setViewMode('heatmap')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'heatmap' ? 'var(--accent-orange)' : 'transparent',
                color: viewMode === 'heatmap' ? '#fff' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <LayoutGrid size={16} /> Grid Heatmap
            </button>
            <button 
              onClick={() => setViewMode('network')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'network' ? 'var(--accent-orange)' : 'transparent',
                color: viewMode === 'network' ? '#fff' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <Network size={16} /> Skill Network Graph
            </button>
          </div>
        </div>

        {viewMode === 'heatmap' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px 12px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {viewMode === 'heatmap' ? (
        <>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', alignItems: 'center' }}>
            <strong>Proficiency Legend:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)' }}></div>
              <span>None</span>
            </div>
            {[1, 2, 3, 4, 5].map(lvl => (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: getCellColor(lvl) }}></div>
                <span>Lvl {lvl}</span>
              </div>
            ))}
            <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '12px', display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a855f7' }}><Sparkles size={14} /> AI Validated</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}><ShieldCheck size={14} /> Manager Verified</span>
            </div>
          </div>

          {/* Grid View */}
          <div className="directory-table-container" style={{ marginTop: '20px', padding: 0, overflow: 'auto', maxHeight: '600px' }}>
            {filteredEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No employees match filters.</div>
            ) : (
              <table style={{ borderCollapse: 'collapse', width: '100%', color: 'var(--text-main)', position: 'relative' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-dark)' }}>
                    <th style={{ 
                      position: 'sticky', 
                      left: 0, 
                      top: 0, 
                      background: 'var(--bg-dark)', 
                      zIndex: 3, 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      borderBottom: '2px solid var(--border-light)',
                      borderRight: '2px solid var(--border-light)',
                      minWidth: '180px'
                    }}>Employee</th>
                    {skills.map(s => (
                      <th key={s.id} style={{ 
                        position: 'sticky', 
                        top: 0, 
                        background: 'var(--bg-dark)', 
                        zIndex: 2, 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        borderBottom: '2px solid var(--border-light)',
                        fontSize: '0.85rem',
                        minWidth: '110px',
                        whiteSpace: 'nowrap'
                      }} title={s.description}>{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ 
                        position: 'sticky', 
                        left: 0, 
                        background: 'var(--card-bg)', 
                        zIndex: 1, 
                        padding: '12px 16px', 
                        fontWeight: '600',
                        borderRight: '2px solid var(--border-light)',
                        whiteSpace: 'nowrap'
                      }}>
                        <div>{emp.user?.first_name} {emp.user?.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{emp.department?.name || 'No Dept'}</div>
                      </td>
                      {skills.map(s => {
                        const es = getEmpSkill(emp.id, s.id);
                        const val = es ? es.proficiency : 0;
                        const status = es?.verification_status;
                        return (
                          <td 
                            key={s.id} 
                            style={{ 
                              background: getCellColor(val), 
                              color: getCellTextColor(val),
                              textAlign: 'center', 
                              fontWeight: val > 0 ? 'bold' : 'normal',
                              padding: '12px 10px',
                              borderRight: '1px solid var(--border-light)',
                              position: 'relative'
                            }}
                            title={`${emp.user?.first_name} - ${s.name}: Level ${val} (${status || 'Unassessed'})`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              {val > 0 ? val : '-'}
                              {status === 'ai_validated' && <Sparkles size={11} color="#c084fc" />}
                              {status === 'manager_verified' && <ShieldCheck size={11} color="#34d399" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* Skill Network SVG Graph View */
        <div style={{ marginTop: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Interactive Organizational Skill Network</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Visualizing relationships between skills (purple) and employees (orange).</p>
          <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-dark)', padding: '20px' }}>
            <svg width="850" height="500" viewBox="0 0 850 500">
              {/* Connected Lines */}
              {employees.slice(0, 8).map((emp, empIdx) => {
                const empX = 150 + (empIdx % 2) * 550;
                const empY = 60 + Math.floor(empIdx / 2) * 110;
                return skills.slice(0, 6).map((sk, skIdx) => {
                  const skX = 425;
                  const skY = 70 + skIdx * 75;
                  const val = getProficiency(emp.id, sk.id);
                  if (val === 0) return null;
                  return (
                    <line 
                      key={`${emp.id}-${sk.id}`}
                      x1={empX} 
                      y1={empY} 
                      x2={skX} 
                      y2={skY} 
                      stroke={val >= 3 ? 'rgba(139, 92, 246, 0.6)' : 'var(--border-light)'} 
                      strokeWidth={val}
                    />
                  );
                });
              })}

              {/* Central Skill Nodes */}
              {skills.slice(0, 6).map((sk, idx) => {
                const skX = 425;
                const skY = 70 + idx * 75;
                return (
                  <g key={`sk-node-${sk.id}`}>
                    <circle cx={skX} cy={skY} r="24" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" />
                    <text x={skX} y={skY + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                      {sk.name.substring(0, 10)}
                    </text>
                  </g>
                );
              })}

              {/* Employee Outer Nodes */}
              {employees.slice(0, 8).map((emp, idx) => {
                const empX = 150 + (idx % 2) * 550;
                const empY = 60 + Math.floor(idx / 2) * 110;
                return (
                  <g key={`emp-node-${emp.id}`}>
                    <circle cx={empX} cy={empY} r="22" fill="var(--accent-orange)" stroke="var(--accent-orange-hover, #e57a15)" strokeWidth="2" />
                    <text x={empX} y={empY + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                      {emp.user?.first_name || 'Emp'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Smart Team Finder Modal */}
      {showTeamFinder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', maxWidth: '650px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Sparkles color="var(--accent-purple, #8b5cf6)" /> Smart AI Team Staffing Finder
              </h3>
              <button onClick={() => setShowTeamFinder(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Select required skills to instantly calculate matching employees by competency coverage.</p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Required Skills:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '10px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                {skills.map(s => {
                  const isSel = selectedSkillIds.includes(s.id);
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => {
                        setSelectedSkillIds(prev => isSel ? prev.filter(id => id !== s.id) : [...prev, s.id]);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-light)',
                        background: isSel ? 'var(--accent-orange)' : 'var(--card-bg)',
                        color: isSel ? '#fff' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={runSmartMatcher} disabled={matcherLoading}>
              {matcherLoading ? 'Calculating Skill Match...' : 'Find Top Matching Team Members'}
            </button>

            {teamMatches && (
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>Top Candidates ({teamMatches.total_candidates} Evaluated):</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teamMatches.top_matches.slice(0, 5).map((m, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.position} • {m.department}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: m.match_percentage >= 70 ? '#10b981' : '#f59e0b' }}>
                          {m.match_percentage}% Match
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Covered {m.matched_count}/{m.total_required} skills</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsMatrix;
