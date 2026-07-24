import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    position_id: '',
    phone: '',
    department_id: '',
    gender: '',
    bio: '',
  });
  const [countryCode, setCountryCode] = useState('+254');

  const countries = [
    { code: '+1', name: 'USA/Canada' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+91', name: 'India' },
    { code: '+254', name: 'Kenya' },
    { code: '+234', name: 'Nigeria' },
    { code: '+27', name: 'South Africa' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+81', name: 'Japan' },
    { code: '+86', name: 'China' },
    { code: '+971', name: 'UAE' },
    { code: '+966', name: 'Saudi Arabia' },
  ];

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    // Fetch departments and positions for dropdown
    const fetchData = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          api.get('departments/'),
          api.get('positions/')
        ]);
        setDepartments(deptRes.data.results || deptRes.data);
        setPositions(posRes.data.results || posRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const patchData = {
        phone: formData.phone ? `${countryCode} ${formData.phone}` : '',
      };
      if (formData.department_id) {
        patchData.department = formData.department_id;
      }
      if (formData.position_id) {
        patchData.position = formData.position_id;
      }
      if (formData.gender) {
        patchData.gender = formData.gender;
      }
      if (formData.bio) {
        patchData.bio = formData.bio;
      }

      await api.patch('employees/me/', patchData);
      toast.success('Profile completed successfully!');
      
      // Fetch fresh user data
      const res = await api.get('auth/me/');
      setUser(res.data);
      
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-left-content">
            
            <div className="login-logo">
              Skill<span>Matrix.</span>
            </div>
            
            <div className="login-header">
              <h2>Complete your profile</h2>
              <p>Tell us a bit more about your role</p>
            </div>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Job Position</label>
                <select 
                  value={formData.position_id}
                  onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ width: '140px', padding: '12px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.code} {c.name}</option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 000-0000"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department (Optional)</label>
                <select 
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Gender (Optional)</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Professional Bio (Optional)</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us a little about your background and expertise..."
                  rows="3"
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', resize: 'vertical' }}
                />
              </div>
              
              <button type="submit" className="btn-login" disabled={isLoading} style={{ marginTop: '20px' }}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
