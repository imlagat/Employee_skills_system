import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, CheckCircle, AlertTriangle, BookOpen, ChevronRight, Award, Compass, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './EmployeeDirectory.css';

const ROADMAP_SH_DATA = {
  frontend: [
    { title: "Internet Fundamentals", desc: "How browsers work, DNS lookup, HTTP/HTTPS request-response cycles, and hosting basics." },
    { title: "Semantic HTML & Responsive CSS", desc: "Using proper HTML5 markup, flexbox, grid layouts, media queries, and mobile-first responsive design." },
    { title: "Modern JavaScript (ES6+)", desc: "Asynchronous programming (Promises, async/await), DOM manipulation, closures, and fetching APIs." },
    { title: "VCS & Git", desc: "Basic branching, committing, pull requests, resolving merge conflicts, and GitHub collaboration." },
    { title: "Package Managers & Bundlers", desc: "Managing npm/yarn packages, using Vite or Webpack for asset bundling and environment optimization." },
    { title: "Component Framework (React)", desc: "Understanding props, state, hooks (useState, useEffect), custom hooks, routing, and state management." }
  ],
  backend: [
    { title: "OS & Server Basics", desc: "Understanding memory, process management, file systems, threads, concurrency, and Linux CLI navigation." },
    { title: "Relational Databases", desc: "Designing database schemas, normalization, writing complex SQL queries, and utilizing database indexes (e.g. PostgreSQL)." },
    { title: "API Development & Formats", desc: "Implementing RESTful endpoints, understanding request status codes, JSON serialization, and GraphQL/gRPC alternatives." },
    { title: "API Security", desc: "Enforcing JWT authentication, session handling, CORS policies, rate limiting, and hashing passwords safely." },
    { title: "Caching Strategies", desc: "Speeding up database requests using memory stores like Redis, CDN setups, and static page generation caching." },
    { title: "Testing & CI/CD", desc: "Writing unit/integration tests, mocking dependencies, and building automatic integration workflows (GitHub Actions)." }
  ],
  devops: [
    { title: "Shell Scripting & Programming", desc: "Writing automation scripts in Bash, Python, or Go, and cron job scheduling." },
    { title: "Server Administration", desc: "Managing Linux servers, SSH configurations, firewall policies, Nginx reverse proxying, and SSL setup." },
    { title: "Infrastructure as Code (IaC)", desc: "Provisioning cloud resources declaratively using Terraform scripts or Ansible configuration playbooks." },
    { title: "Containers & Microservices", desc: "Packaging applications using Dockerfiles, and orchestration setups via Kubernetes namespaces and pods." },
    { title: "Automated Deployments", desc: "Building secure, zero-downtime CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions)." },
    { title: "Observability", desc: "Collecting server/app telemetry using Prometheus, visualizing dashboards in Grafana, and log indexing (ELK stack)." }
  ],
  default: [
    { title: "Professional Development Plan", desc: "Synthesizing cross-functional soft skills, technical documentation writing, and team communication workflows." },
    { title: "Agile Project Delivery", desc: "Working with Scrum processes, tracking tasks on Jira boards, and participating in sprint reviews." },
    { title: "System Architecture Design", desc: "Understanding service boundaries, design patterns, DRY principles, and system scalability constraints." }
  ]
};

const CareerPathing = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [mySkills, setMySkills] = useState([]);
  const [positions, setPositions] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRoadmapTab, setActiveRoadmapTab] = useState('internal'); // 'internal' or 'roadmap_sh'
  const [completedShTopics, setCompletedShTopics] = useState(() => {
    const saved = localStorage.getItem('completed_roadmap_sh_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleShTopic = (posId, topicTitle) => {
    const key = `${posId}_${topicTitle}`;
    const updated = {
      ...completedShTopics,
      [key]: !completedShTopics[key]
    };
    setCompletedShTopics(updated);
    localStorage.setItem('completed_roadmap_sh_topics', JSON.stringify(updated));
    toast.success("Progress saved!");
  };

  const getRoadmapShTopics = (posName) => {
    if (!posName) return ROADMAP_SH_DATA.default;
    const name = posName.toLowerCase();
    if (name.includes('frontend')) return ROADMAP_SH_DATA.frontend;
    if (name.includes('backend')) return ROADMAP_SH_DATA.backend;
    if (name.includes('devops') || name.includes('platform')) return ROADMAP_SH_DATA.devops;
    if (name.includes('full') || name.includes('software')) return [...ROADMAP_SH_DATA.frontend.slice(0, 3), ...ROADMAP_SH_DATA.backend.slice(2, 5)];
    return ROADMAP_SH_DATA.default;
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Get current employee profile
      const empRes = await api.get('/employees/me/');
      const empData = empRes.data;
      setEmployee(empData);

      // 2. Fetch my skills
      const skillsRes = await api.get(`/employee-skills/?employee=${empData.id}`);
      setMySkills(skillsRes.data.results || skillsRes.data || []);

      // 3. Fetch positions
      const posRes = await api.get('/positions/');
      setPositions(posRes.data.results || posRes.data || []);

      // 4. Fetch all position competencies
      const compRes = await api.get('/position-competencies/');
      setCompetencies(compRes.data.results || compRes.data || []);

      // 5. Fetch upcoming trainings
      const trainRes = await api.get('/programs/');
      setTrainings(trainRes.data.results || trainRes.data || []);

      // Set initial target position (default to next role or first position)
      if (empData.position) {
        setSelectedPositionId(empData.position.id);
      } else if (posRes.data.length > 0) {
        setSelectedPositionId(posRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load career pathing data.");
    } finally {
      setLoading(false);
    }
  };

  const getTargetPositionDetails = () => {
    return positions.find(p => p.id === parseInt(selectedPositionId));
  };

  const getTargetCompetencies = () => {
    return competencies.filter(c => c.position === parseInt(selectedPositionId));
  };

  const calculateReadiness = (targetComps) => {
    if (targetComps.length === 0) return 0;
    let metCount = 0;
    targetComps.forEach(comp => {
      const mySkill = mySkills.find(s => s.skill === comp.skill);
      if (mySkill && mySkill.proficiency >= comp.required_level) {
        metCount += 1;
      }
    });
    return Math.round((metCount / targetComps.length) * 100);
  };

  const getSkillComparison = (comp) => {
    const mySkill = mySkills.find(s => s.skill === comp.skill);
    const currentLevel = mySkill ? mySkill.proficiency : 0;
    const requiredLevel = comp.required_level;
    const isMet = currentLevel >= requiredLevel;
    const gap = isMet ? 0 : requiredLevel - currentLevel;

    return { currentLevel, requiredLevel, isMet, gap };
  };

  const getExternalRoadmapUrl = (positionName) => {
    if (!positionName) return null;
    const name = positionName.toLowerCase();
    if (name.includes('frontend')) return 'https://roadmap.sh/frontend';
    if (name.includes('backend')) return 'https://roadmap.sh/backend';
    if (name.includes('devops') || name.includes('platform')) return 'https://roadmap.sh/devops';
    if (name.includes('full') || name.includes('software')) return 'https://roadmap.sh/full-stack';
    if (name.includes('data') || name.includes('analyst')) return 'https://roadmap.sh/data-analyst';
    if (name.includes('manager') || name.includes('lead')) return 'https://roadmap.sh/engineering-manager';
    return 'https://roadmap.sh';
  };

  if (loading) {
    return <div className="loading-state" style={{ padding: '40px' }}>Loading Career Pathing insights...</div>;
  }

  const targetPos = getTargetPositionDetails();
  const targetComps = getTargetCompetencies();
  const readiness = calculateReadiness(targetComps);

  return (
    <div className="directory-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Compass size={28} color="var(--accent-orange)" /> Career Pathing & Roadmap</h2>
          <p>Assess alignment and bridge skill gaps for your target position.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Target Position:</span>
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            style={{ padding: '10px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer' }}
          >
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>{pos.name}</option>
            ))}
          </select>
          <button className="icon-btn-small" onClick={fetchInitialData} title="Refresh details" style={{ padding: '10px' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {targetPos ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          {/* Readiness Dashboard Panel */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(246, 139, 31, 0.08) 0%, rgba(30, 41, 59, 0.5) 100%)', 
            border: '1px solid rgba(246, 139, 31, 0.25)', 
            borderRadius: '16px', 
            padding: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '30px', 
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="var(--accent-orange)" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - readiness / 100)}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {readiness}%
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: 'var(--text-main)' }}>{targetPos.name} Readiness</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                You meet {targetComps.filter(c => getSkillComparison(c).isMet).length} out of {targetComps.length} required skill proficiencies for this position. 
                {readiness === 100 ? " Excellent job! You are fully qualified for this role." : " Use the roadmap below to target skills needing development."}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'flex-start' }} className="career-grid-layout">
            {/* Interactive Timeline Roadmap */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="var(--accent-orange)" /> Roadmap Guide
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setActiveRoadmapTab('internal')}
                    style={{
                      padding: '6px 12px',
                      background: activeRoadmapTab === 'internal' ? 'var(--accent-orange, #f68b1f)' : 'transparent',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      color: activeRoadmapTab === 'internal' ? 'white' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Company Skills
                  </button>
                  <button 
                    onClick={() => setActiveRoadmapTab('ai_coach')}
                    style={{
                      padding: '6px 12px',
                      background: activeRoadmapTab === 'ai_coach' ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      color: activeRoadmapTab === 'ai_coach' ? 'white' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ✨ AI 30-60-90 Day Plan
                  </button>
                  <button 
                    onClick={() => setActiveRoadmapTab('roadmap_sh')}
                    style={{
                      padding: '6px 12px',
                      background: activeRoadmapTab === 'roadmap_sh' ? 'var(--accent-orange, #f68b1f)' : 'transparent',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      color: activeRoadmapTab === 'roadmap_sh' ? 'white' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Roadmap.sh Suggested
                  </button>
                </div>
              </div>

              {activeRoadmapTab === 'internal' ? (
                targetComps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No required competencies defined for the {targetPos.name} position.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px', borderLeft: '2px dashed var(--border-light)' }}>
                    {targetComps.map((comp, idx) => {
                      const { currentLevel, requiredLevel, isMet, gap } = getSkillComparison(comp);
                      return (
                        <div key={comp.id} style={{ position: 'relative', marginBottom: '24px' }}>
                          {/* Dot marker */}
                          <div style={{ 
                            position: 'absolute', 
                            left: '-33px', 
                            top: '4px', 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            background: isMet ? '#10b981' : gap <= 1 ? '#f68b1f' : '#ef4444',
                            border: '3px solid var(--bg-dark)',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                          }} />
                          
                          <div style={{ 
                            background: 'var(--bg-dark)', 
                            border: `1px solid ${isMet ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-light)'}`, 
                            borderRadius: '10px', 
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '15px'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{comp.skill_name}</strong>
                                {comp.is_critical && (
                                  <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>CRITICAL</span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Required Proficiency: Level {requiredLevel} • Your Level: {currentLevel}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isMet ? (
                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                  <CheckCircle size={16} /> Met
                                </span>
                              ) : (
                                <span style={{ color: gap <= 1 ? '#f68b1f' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                  <AlertTriangle size={16} /> Gap: {gap} Level{gap > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : activeRoadmapTab === 'ai_coach' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'var(--bg-dark)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#c084fc', fontSize: '1rem' }}>📅 Month 1 (Days 1–30): Foundation & Skill Gap Auditing</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Complete foundational internal training courses for <strong>{targetPos.name}</strong>. Focus on critical skills with the largest gap sizes.
                    </p>
                  </div>
                  <div style={{ background: 'var(--bg-dark)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '1rem' }}>🚀 Month 2 (Days 31–60): Internal Micro-Gigs & Practical Execution</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Claim 1–2 internal micro-projects on the Gig Marketplace to apply newly acquired competencies in real projects.
                    </p>
                  </div>
                  <div style={{ background: 'var(--bg-dark)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#34d399', fontSize: '1rem' }}>🏆 Month 3 (Days 61–90): 360 Assessment & Manager Verification</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Schedule a formal 360 skills assessment with your manager to verify proficiency progression and confirm promotion readiness.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px', borderLeft: '2px dashed var(--border-light)' }}>
                  {getRoadmapShTopics(targetPos.name).map((topic, idx) => {
                    const isChecked = !!completedShTopics[`${selectedPositionId}_${topic.title}`];
                    return (
                      <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
                        <div style={{ 
                          position: 'absolute', 
                          left: '-33px', 
                          top: '4px', 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          background: isChecked ? '#10b981' : '#64748b',
                          border: '3px solid var(--bg-dark)',
                          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                        }} />
                        
                        <div style={{ 
                          background: 'var(--bg-dark)', 
                          border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-light)'}`, 
                          borderRadius: '10px', 
                          padding: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '15px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{topic.title}</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{topic.desc}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => toggleShTopic(selectedPositionId, topic.title)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              {isChecked ? 'Studied' : 'Mark studied'}
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="var(--accent-orange)" /> Suggested Training
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trainings.slice(0, 3).map(t => (
                    <div key={t.id} style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>{t.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {t.location || 'Online'}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starts: {t.start_date}</p>
                    </div>
                  ))}
                  {trainings.length === 0 && (
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px' }}>
                      No active training programs.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--accent-orange)" /> Certification Pathways
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Review your required skills timeline and check the <a href="/learning/certifications" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 'bold' }}>Certifications Portal</a> to upload credentials that bypass manual evaluations.
                </div>
              </div>

              {getExternalRoadmapUrl(targetPos.name) && (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={18} color="var(--accent-orange)" /> Roadmap.sh Guide
                  </h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Explore the community-curated, industry-standard skill map for this role on Roadmap.sh.
                  </p>
                  <a 
                    href={getExternalRoadmapUrl(targetPos.name)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary"
                    style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    View External Roadmap
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No positions found.</div>
      )}
    </div>
  );
};

export default CareerPathing;
