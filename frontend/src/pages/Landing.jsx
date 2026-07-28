import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Award, Activity, ShieldCheck, HelpCircle, 
  Mail, Phone, MapPin, Send, Menu, X, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
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
      answer: "SkillMatrix is a comprehensive skill management and talent passport platform that helps companies map, verify, and improve workforce competencies using AI-driven insights."
    },
    {
      question: "How does the email invitation system work?",
      answer: "Administrators and managers can invite new employees or managers via their email. The invitee receives a secure link to set their password and complete their profile, instantly granting them appropriate system access."
    },
    {
      question: "Can employees parse resumes to populate skills?",
      answer: "Yes! SkillMatrix integrates Google Gemini AI to analyze uploaded PDF resumes and automatically extract skills and certifications to auto-populate the digital Talent Passport."
    },
    {
      question: "Is my personal employee data secure?",
      answer: "Absolutely. We employ enterprise-grade security and role-based permissions to ensure that employee details, career paths, and assessments are only visible to authorized personnel."
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* Topbar / Navigation */}
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
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
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
              <ShieldCheck size={16} /> Fully Cloud Hosted & Secured
            </div>
            <h1>Scale Your Workforce Competencies with AI</h1>
            <p>
              SkillMatrix maps employee skills, manages certifications, identifies competency gaps, and builds succession plans to elevate your team.
            </p>
            <div className="hero-actions">
              {user ? (
                <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => navigate('/dashboard')}>
                  Enter Dashboard <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <Link to="/signup" className="landing-btn landing-btn-primary landing-btn-lg">
                    Get Started <ArrowRight size={18} />
                  </Link>
                  <a href="#features" className="landing-btn landing-btn-outline landing-btn-lg">
                    Learn More
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-mockup main-mockup">
              <div className="mockup-header">
                <div className="mockup-avatar">S</div>
                <div>
                  <h4>Sarah Jenkins</h4>
                  <p>Lead Engineer • Engineering</p>
                </div>
              </div>
              <div className="mockup-skills">
                <div className="mockup-skill">
                  <span>React / Frontend</span>
                  <div className="mockup-bar"><div className="mockup-fill" style={{ width: '90%' }}></div></div>
                </div>
                <div className="mockup-skill">
                  <span>Python / Django</span>
                  <div className="mockup-bar"><div className="mockup-fill" style={{ width: '80%' }}></div></div>
                </div>
                <div className="mockup-skill">
                  <span>System Architecture</span>
                  <div className="mockup-bar"><div className="mockup-fill" style={{ width: '70%' }}></div></div>
                </div>
              </div>
            </div>
            <div className="hero-card-mockup float-mockup">
              <div className="mockup-badge">
                <Award size={18} color="var(--accent-orange)" />
                <div>
                  <h5>AWS Certified Solutions Architect</h5>
                  <p>Valid until 2029</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="section-header">
            <h2>Core Features</h2>
            <p>Everything you need to track, evaluate, and develop your organization's talent.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-blue">
                <Users size={24} />
              </div>
              <h3>Digital Talent Passports</h3>
              <p>Every employee gets a shareable digital skill profile displaying verified competencies, credentials, and achievements.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-purple">
                <Award size={24} />
              </div>
              <h3>Certification Management</h3>
              <p>Keep track of employee licenses and certifications. Receive automated notifications before credentials expire.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-orange">
                <Activity size={24} />
              </div>
              <h3>AI-Powered Insights</h3>
              <p>Utilize Gemini AI to parse resumes, auto-populate skills, and recommend targeted training programs to close gaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <div className="landing-container about-flex">
          <div className="about-image-side">
            <div className="about-visual-grid">
              <div className="grid-box box-1">Map Skills</div>
              <div className="grid-box box-2">Track Certs</div>
              <div className="grid-box box-3">Train Teams</div>
              <div className="grid-box box-4">Plan Succession</div>
            </div>
          </div>
          <div className="about-text-side">
            <h2>About SkillMatrix</h2>
            <p>
              We believe in data-driven talent management. Our platform bridges the gap between organizational goals and individual career paths, creating transparency and growth opportunities.
            </p>
            <p>
              Whether you are an administrator managing hundreds of profiles, a manager scheduling training courses, or an employee updating your qualifications, SkillMatrix provides a unified, responsive interface designed to optimize your workspace.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-faq">
        <div className="landing-container faq-max">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Got questions? We've got answers.</p>
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
            <h2>Contact Us</h2>
            <p>Have questions or need assistance setting up your workspace? Reach out to our team!</p>
            
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
