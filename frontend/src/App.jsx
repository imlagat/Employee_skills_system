import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import AcceptInvite from './pages/AcceptInvite';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import UserManagement from './pages/UserManagement';
import Home from './pages/Home';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeDetail from './pages/EmployeeDetail';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Positions from './pages/Positions';
import PositionDetail from './pages/PositionDetail';
import Skills from './pages/Skills';
import Competencies from './pages/Competencies';
import Training from './pages/Training';
import Certifications from './pages/Certifications';
import Assessments from './pages/Assessments';
import CareerPathing from './pages/CareerPathing';
import SkillsMatrix from './pages/SkillsMatrix';
import Succession from './pages/Succession';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfile';
import GigsMarketplace from './pages/GigsMarketplace';
import HRRequests from './pages/HRRequests';
import HRApprovals from './pages/HRApprovals';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 80, // Push below navbar
          right: 20,
        }}
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-light)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-orange, #f68b1f)',
              secondary: 'var(--bg-dark, #1a202c)',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
        <Route path="/hr-requests" element={<ProtectedRoute><Layout><HRRequests /></Layout></ProtectedRoute>} />

        <Route path="/hr-approvals" element={<ProtectedRoute><Layout><HRApprovals /></Layout></ProtectedRoute>} />
        
        {/* People Module */}
        <Route path="/people/employees" element={<ProtectedRoute><Layout><EmployeeDirectory /></Layout></ProtectedRoute>} />
        <Route path="/people/employees/:id" element={<ProtectedRoute><Layout><EmployeeDetail /></Layout></ProtectedRoute>} />
        <Route path="/people/skills-matrix" element={<ProtectedRoute><Layout><SkillsMatrix /></Layout></ProtectedRoute>} />
        <Route path="/people/departments" element={<ProtectedRoute><Layout><Departments /></Layout></ProtectedRoute>} />
        <Route path="/people/departments/:id" element={<ProtectedRoute><Layout><DepartmentDetail /></Layout></ProtectedRoute>} />
        <Route path="/people/positions" element={<ProtectedRoute><Layout><Positions /></Layout></ProtectedRoute>} />
        <Route path="/people/positions/:id" element={<ProtectedRoute><Layout><PositionDetail /></Layout></ProtectedRoute>} />
        
        {/* Learning & Development Module */}
        <Route path="/learning/skills" element={<ProtectedRoute><Layout><Skills /></Layout></ProtectedRoute>} />
        <Route path="/learning/competencies" element={<ProtectedRoute><Layout><Competencies /></Layout></ProtectedRoute>} />
        <Route path="/learning/training" element={<ProtectedRoute><Layout><Training /></Layout></ProtectedRoute>} />
        <Route path="/learning/certifications" element={<ProtectedRoute><Layout><Certifications /></Layout></ProtectedRoute>} />
        <Route path="/learning/gigs" element={<ProtectedRoute><Layout><GigsMarketplace /></Layout></ProtectedRoute>} />
        <Route path="/learning/career-pathing" element={<ProtectedRoute><Layout><CareerPathing /></Layout></ProtectedRoute>} />
        
        {/* Performance Module */}
        <Route path="/performance/assessments" element={<ProtectedRoute><Layout><Assessments /></Layout></ProtectedRoute>} />
        {/* Placeholders for new pages routing to Home for now until built */}
        <Route path="/performance/gaps" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/performance/succession" element={<ProtectedRoute><Layout><Succession /></Layout></ProtectedRoute>} />
        
        {/* Analytics Module */}
        <Route path="/analytics/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/analytics/insights" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        
        {/* Admin Module */}
        <Route path="/admin/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
