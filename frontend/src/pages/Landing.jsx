import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Award, Activity, ShieldCheck, HelpCircle, 
  Mail, Phone, MapPin, Send, Menu, X, ArrowRight, 
  CheckCircle2, Sparkles, Compass, Target, Database,
  TrendingUp, ArrowUpRight, MessageSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('passport');
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is SkillMatrix?",
      answer: "SkillMatrix is a competency management platform designed to map, verify, and scale organizational talents. It unifies digital skill profiles, certificates, and workforce analytics under a single secure directory."
    },
    {
      question: "How does the email invitation system work?",
      answer: "Administrators and managers can invite new members by providing their email and selecting their system role. The system issues a secure verification link to the invitee, allowing them to register, choose a password, and populate their profile."
    },
    {
      question: "Can employees parse resumes to populate skills?",
      answer: "Yes. SkillMatrix integrates Google Gemini AI to analyze uploaded PDF resumes and automatically extract skills, certifications, and work experience to populate the employee's Talent Passport."
    },
    {
      question: "Is there a role-based permission system?",
      answer: "Absolutely. SkillMatrix has strict role configurations (Admin, HR, Manager, Employee). Employees can manage their personal profiles and courses, while managers and HR run compliance reporting, edit competencies, and outline succession plans."
    }
  ];

  const showcaseMockups = {
    passport: (
      <div className="showcase-mockup-inner passport-mock">
        <div className="passport-card-header">
          <div className="passport-avatar-icon">JD</div>
          <div>
            <h4>Jane Doe</h4>
            <p>Senior Frontend Developer</p>
          </div>
          <span className="verified-badge">
            <ShieldCheck size={14} /> Verified
          </span>
        </div>
        <div className="passport-body-list">
          <div className="body-item">
            <span>Engineering Department</span>
            <strong>Software Architecture Group</strong>
          </div>
          <div className="body-item">
            <span>Active Certificates</span>
            <strong>AWS Certified Cloud Practitioner</strong>
          </div>
          <div className="body-item">
            <span>Primary Core Skills</span>
            <div className="skills-tags-row">
              <span className="skill-tag">React / TypeScript</span>
              <span className="skill-tag">GraphQL</span>
              <span className="skill-tag">Vite & Rollup</span>
            </div>
          </div>
        </div>
      </div>
    ),
    coach: (
      <div className="showcase-mockup-inner coach-mock">
        <div className="chat-header">
          <Sparkles size={16} color="var(--accent-orange)" />
          <span>Gemini AI Career Coach</span>
        </div>
        <div className="chat-messages">
          <div className="chat-msg ai-msg">
            <p>Based on your current skill index (React: 4/5) and your target role (Lead Frontend Developer), I recommend adding <strong>GraphQL</strong> and <strong>Performance Optimization</strong> to your profile. Would you like to review training programs?</p>
          </div>
          <div className="chat-msg user-msg">
            <p>Yes, show me training programs starting this month.</p>
          </div>
          <div className="chat-msg ai-msg">
            <p>Here is an active option: <br/><strong>📘 GraphQL APIs in Production</strong><br/>Starts: Aug 12 • 4 Modules • Certified</p>
          </div>
        </div>
      </div>
    ),
    heatmap: (
      <div className="showcase-mockup-inner matrix-mock">
        <h4>Workforce Competency Heatmap</h4>
        <p className="mock-subtitle">Cross-department skill depth representation</p>
        <div className="heatmap-grid">
          <div className="heatmap-row">
            <span className="row-label">Engineering</span>
            <div className="cells">
              <div className="cell cell-high" title="TypeScript: 4.8"></div>
              <div className="cell cell-high" title="React: 4.5"></div>
              <div className="cell cell-medium" title="Go: 3.2"></div>
              <div className="cell cell-low" title="Docker: 2.1"></div>
            </div>
          </div>
          <div className="heatmap-row">
            <span className="row-label">Design</span>
            <div className="cells">
              <div className="cell cell-high" title="Figma: 4.9"></div>
              <div className="cell cell-medium" title="UI Design: 3.8"></div>
              <div className="cell cell-low" title="Framer: 2.0"></div>
              <div className="cell cell-zero" title="Python: 0"></div>
            </div>
          </div>
          <div className="heatmap-row">
            <span className="row-label">Product</span>
            <div className="cells">
              <div className="cell cell-high" title="Roadmapping: 4.6"></div>
              <div className="cell cell-high" title="Agile: 4.5"></div>
              <div className="cell cell-medium" title="SQL: 3.0"></div>
              <div className="cell cell-low" title="APIs: 1.8"></div>
            </div>
          </div>
        </div>
        <div className="heatmap-legend">
          <span>Depth:</span>
          <div className="legend-box cell-zero"></div> 0
          <div className="legend-box cell-low"></div> 1-2
          <div className="legend-box cell-medium"></div> 3
          <div className="legend-box cell-high"></div> 4-5
        </div>
      </div>
    ),
    succession: (
      <div className="showcase-mockup-inner succession-mock">
        <h4>Succession Match Analysis</h4>
        <div className="role-card">
          <div className="role-header">
            <strong>Director of Engineering</strong>
            <span className="critical-badge">Critical Role</span>
          </div>
          <div className="successors-list">
            <div className="successor-item">
              <div className="successor-info">
                <strong>Sarah Jenkins</strong>
                <span>Lead Architect</span>
              </div>
              <div className="readiness-pill ready-now">Ready in 3mo</div>
              <div className="match-score">94% Match</div>
            </div>
            <div className="successor-item">
              <div className="successor-info">
                <strong>Michael Chen</strong>
                <span>Senior Manager</span>
              </div>
              <div className="readiness-pill ready-later">Ready in 1yr</div>
              <div className="match-score">82% Match</div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="landing-wrapper">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-container nav-flex">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">§</div>
            <span>SkillMatrix</span>
          </Link>

          <button className="landing-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            
            <div className="landing-nav-ctas">
              {user ? (
                <button className="landing-btn landing-btn-primary" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" className="landing-btn landing-btn-outline" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="landing-btn landing-btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-text-content">
            <div className="hero-badge">
              <Sparkles size={14} /> AI-Powered Talent Mobility
            </div>
            <h1>Map. Verify. Scale. Your Team's Skill Matrix.</h1>
            <p>
              Unify employee talents, verify certifications, identify competency gaps, and build robust succession plans. All powered by Google Gemini AI-driven insights.
            </p>
            <div className="hero-actions">
              {user ? (
                <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => navigate('/dashboard')}>
                  Enter Dashboard <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-lg">
                    Start Mapping <ArrowRight size={18} />
                  </Link>
                  <a href="#features" className="landing-btn landing-btn-outline landing-btn-lg">
                    Explore Features
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="hero-visual">
            {/* SaaS Interactive Application Mockup Shell */}
            <div className="browser-shell">
              <div className="browser-header">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="browser-address">skillmatrix.company.com/dashboard</div>
              </div>
              <div className="browser-content">
                <div className="mock-dashboard">
                  <div className="mock-topbar">
                    <h5>Workforce Overview</h5>
                    <div className="avatar-placeholder">A</div>
                  </div>
                  <div className="mock-grid">
                    <div className="mock-card">
                      <span className="card-label">Employees Mapped</span>
                      <h3>128</h3>
                    </div>
                    <div className="mock-card">
                      <span className="card-label">Expiring Certifications</span>
                      <h3 style={{ color: 'var(--accent-teal)' }}>4</h3>
                    </div>
                    <div className="mock-card">
                      <span className="card-label">Skill Gaps Solved</span>
                      <h3 style={{ color: '#10b981' }}>98%</h3>
                    </div>
                  </div>
                  <div className="mock-chart-section">
                    <h6>Workforce Competency Growth Index</h6>
                    <div className="chart-bars">
                      <div className="bar-row">
                        <span>TypeScript</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: '85%' }}></div></div>
                      </div>
                      <div className="bar-row">
                        <span>Python / Django</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: '70%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="landing-trusted">
        <div className="landing-container">
          <p>Empowering talent intelligence at forward-thinking companies</p>
          <div className="trusted-logos-grid">
            <span className="logo-text-mock">LINEAR</span>
            <span className="logo-text-mock">STRIPE</span>
            <span className="logo-text-mock">VERCEL</span>
            <span className="logo-text-mock">NOTION</span>
            <span className="logo-text-mock">SUPABASE</span>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section className="landing-stats">
        <div className="landing-container stats-grid">
          <div className="stat-item">
            <h2>99.4%</h2>
            <p>AI Resume Parsing Accuracy</p>
          </div>
          <div className="stat-item">
            <h2>-40%</h2>
            <p>Reduced Skill Gaps in 6 Months</p>
          </div>
          <div className="stat-item">
            <h2>2.5x</h2>
            <p>Faster Employee Onboarding</p>
          </div>
          <div className="stat-item">
            <h2>15k+</h2>
            <p>Verified Skill Credentials Logged</p>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="landing-showcase">
        <div className="landing-container">
          <div className="section-header">
            <h2>Interactive Product Showcase</h2>
            <p>Explore the specialized panels and intelligence features built into the SkillMatrix dashboard.</p>
          </div>

          <div className="showcase-layout">
            <div className="showcase-tabs">
              <button 
                className={`showcase-tab ${activeShowcaseTab === 'passport' ? 'active' : ''}`}
                onClick={() => setActiveShowcaseTab('passport')}
              >
                <ShieldCheck size={18} />
                <span>Talent Passport</span>
              </button>
              <button 
                className={`showcase-tab ${activeShowcaseTab === 'coach' ? 'active' : ''}`}
                onClick={() => setActiveShowcaseTab('coach')}
              >
                <Sparkles size={18} />
                <span>AI Career Coach</span>
              </button>
              <button 
                className={`showcase-tab ${activeShowcaseTab === 'heatmap' ? 'active' : ''}`}
                onClick={() => setActiveShowcaseTab('heatmap')}
              >
                <Target size={18} />
                <span>Skills Heatmap</span>
              </button>
              <button 
                className={`showcase-tab ${activeShowcaseTab === 'succession' ? 'active' : ''}`}
                onClick={() => setActiveShowcaseTab('succession')}
              >
                <Compass size={18} />
                <span>Succession Planning</span>
              </button>
            </div>

            <div className="showcase-window">
              {showcaseMockups[activeShowcaseTab]}
            </div>
          </div>
        </div>
      </section>

      {/* AI Spotlight Section */}
      <section className="landing-ai-spotlight">
        <div className="landing-container spotlight-grid">
          <div className="spotlight-text-side">
            <div className="spotlight-badge"><Sparkles size={14} /> Gemini AI Capabilities</div>
            <h2>Built-in Workforce Intelligence</h2>
            <p>SkillMatrix integrates state-of-the-art AI systems to make managing skills effortless, precise, and predictive.</p>
            
            <ul className="spotlight-features-list">
              <li>
                <CheckCircle2 size={20} color="var(--accent-orange)" />
                <div>
                  <strong>CV / Resume Auto-Populate:</strong> Upload PDF resumes. The AI parses the text and automatically adds verified skills to your employee record.
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} color="var(--accent-orange)" />
                <div>
                  <strong>Predictive Skill Gap Detection:</strong> Scans organizational structures to highlight future training needs and potential compliance bottlenecks.
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} color="var(--accent-orange)" />
                <div>
                  <strong>Automated Career Roadmaps:</strong> Recommends courses, assessments, and certifications matching employee career ambitions.
                </div>
              </li>
            </ul>
          </div>
          <div className="spotlight-visual-side">
            <div className="ai-mesh-card">
              <div className="pulsing-radar"></div>
              <Sparkles size={36} className="spotlight-mesh-icon" />
              <h4>Active Skill Gap Analytics</h4>
              <p>Workforce competency matched against market benchmarks in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section className="landing-stepper">
        <div className="landing-container">
          <div className="section-header">
            <h2>How SkillMatrix Works</h2>
            <p>From setup to team growth, explore the end-to-end skill management workflow.</p>
          </div>

          <div className="stepper-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4>Invite Your Team</h4>
              <p>Administrators and managers issue secure email invitations with pre-defined roles directly from the control panel.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h4>Map Passports</h4>
              <p>Employees register via the link, complete their profiles, and parse their resumes to auto-generate skill profiles.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h4>Track Competencies</h4>
              <p>HR and team managers access color-coded skill grids, manage active certifications, and review assessment logs.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h4>Plan Succession</h4>
              <p>Map successors for key positions, review readiness states, and assign learning goals to build tomorrow's leaders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials">
        <div className="landing-container">
          <div className="section-header">
            <h2>What Leaders Say</h2>
            <p>Hear from administrators and engineering heads managing talent pipelines on SkillMatrix.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"Before SkillMatrix, tracking certifications was a manual nightmare. Now, notifications alert us before licenses expire, keeping our teams 100% compliant."</p>
              <div className="testimonial-user">
                <div className="t-avatar">HC</div>
                <div>
                  <strong>Helen Carter</strong>
                  <span>Head of HR, Nexus Solutions</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"The Gemini AI resume parser makes onboarding new hires a breeze. They upload their CV, and their skill profiles are generated in seconds."</p>
              <div className="testimonial-user">
                <div className="t-avatar">AM</div>
                <div>
                  <strong>Alex Mercer</strong>
                  <span>VP of Engineering, CloudLink</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-faq">
        <div className="landing-container faq-max">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Common questions regarding setup, roles, and profiles.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <HelpCircle size={20} className="faq-icon" />
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-contact">
        <div className="landing-container contact-grid">
          <div className="contact-info-side">
            <h2>Contact Our Team</h2>
            <p>Need support setting up your company workspace or configuring administrator roles? Get in touch with us!</p>
            
            <div className="contact-details">
              <div className="contact-detail-item">
                <Mail size={20} />
                <span>support@skillmatrix.com</span>
              </div>
              <div className="contact-detail-item">
                <Phone size={20} />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="contact-detail-item">
                <MapPin size={20} />
                <span>100 Enterprise Way, Suite 400, San Francisco</span>
              </div>
            </div>
          </div>
          
          <div className="contact-form-side">
            {contactSuccess ? (
              <div className="contact-success-state">
                <CheckCircle2 size={48} color="#10b981" />
                <h3>Thank You!</h3>
                <p>Your message has been sent successfully. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="landing-contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">Name</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    required 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    required 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea 
                    id="contact-message" 
                    rows="4" 
                    required 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="landing-btn landing-btn-primary landing-btn-block">
                  Send Message <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-flex">
          <p>&copy; {new Date().getFullYear()} SkillMatrix. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
