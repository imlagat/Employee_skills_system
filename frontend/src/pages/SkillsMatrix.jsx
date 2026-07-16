import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { LayoutGrid, Download, Building, Search, Info, HelpCircle } from 'lucide-react';
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

  const getProficiency = (employeeId, skillId) => {
    const es = employeeSkills.find(item => item.employee === employeeId && item.skill === skillId);
    return es ? es.proficiency : 0;
  };

  const getCellColor = (level) => {
    switch (level) {
      case 1: return 'rgba(16, 185, 129, 0.15)'; // light emerald
      case 2: return 'rgba(16, 185, 129, 0.35)'; // mid emerald
      case 3: return 'rgba(16, 185, 129, 0.55)'; // strong emerald
      case 4: return 'rgba(16, 185, 129, 0.75)'; // deep emerald
      case 5: return 'rgba(16, 185, 129, 0.95)'; // bright glowing emerald
      default: return 'var(--bg-dark)'; // missing
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
    // Header Row
    const headers = ["Employee ID", "Name", "Department", ...skills.map(s => s.name)];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    // Data Rows
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

  if (loading) {
    return <div className="loading-state" style={{ padding: '40px' }}>Loading Skills Heatmap...</div>;
  }

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutGrid size={28} color="var(--accent-orange)" /> Interactive Skills Heatmap</h2>
          <p>Multi-dimensional team matrix mapping employee proficiencies against organizational skills.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={exportToCSV} disabled={filteredEmployees.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters block */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border-light)', 
        padding: '16px', 
        borderRadius: '12px', 
        marginTop: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '8px 12px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><Building size={16} /> Department:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', alignItems: 'center' }}>
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
      </div>

      {/* Heatmap Grid Container */}
      <div className="directory-table-container" style={{ marginTop: '20px', padding: 0, overflow: 'auto', maxHeight: '600px' }}>
        {filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No employees match filters.</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%', color: 'var(--text-main)', position: 'relative' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)' }}>
                {/* Sticky top-left corner */}
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
                  {/* Sticky row label */}
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
                    const val = getProficiency(emp.id, s.id);
                    return (
                      <td 
                        key={s.id} 
                        style={{ 
                          background: getCellColor(val), 
                          color: getCellTextColor(val),
                          textAlign: 'center', 
                          fontWeight: val > 0 ? 'bold' : 'normal',
                          padding: '12px 10px',
                          borderRight: '1px solid var(--border-light)'
                        }}
                        title={`${emp.user?.first_name} ${emp.user?.last_name} - ${s.name}: Level ${val}`}
                      >
                        {val > 0 ? val : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SkillsMatrix;
