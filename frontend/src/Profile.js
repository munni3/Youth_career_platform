import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    educationLevel: '',
    department: '',
    experienceLevel: '',
    preferredTrack: '',
    skills: '',
    cvText: '',
    careerInterests: ''
  });
  const [experience, setExperience] = useState([]);
  const [newExperience, setNewExperience] = useState({ 
    title: '', 
    description: '', 
    duration: '' 
  });
  const [showApplications, setShowApplications] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [currentQuote, setCurrentQuote] = useState('');

  const motivationalQuotes = [
    "Your profile is your personal brand. Make it shine!",
    "Great careers are built on great profiles. Keep yours updated!",
    "Your unique experiences make you valuable. Share your story!",
    "Every skill you add opens new opportunities. Keep learning!",
    "Your career journey is unique. Let your profile reflect your amazing path!"
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        setLoading(true);

        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userObj = res.data;

        setUser(userObj);
        setFormData({
          name: userObj.name || '',
          educationLevel: userObj.educationLevel || '',
          department: userObj.department || '',
          experienceLevel: userObj.experienceLevel || '',
          preferredTrack: userObj.preferredTrack || '',
          skills: userObj.skills?.join(', ') || '',
          cvText: userObj.cvText || '',
          careerInterests: userObj.careerInterests?.join(', ') || ''
        });
        setExperience(userObj.experience || []);

        localStorage.setItem('user', JSON.stringify(userObj));

        await fetchApplications();
      } catch (error) {
        console.error('Error loading user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 10000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:5000/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#17a2b8',
      'Under Review': '#ffc107',
      'Interview': '#007bff',
      'Rejected': '#dc3545',
      'Accepted': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        careerInterests: formData.careerInterests.split(',').map(interest => interest.trim()).filter(interest => interest),
        experience: experience
      };

      const response = await axios.put('http://localhost:5000/api/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setExperience(response.data.experience || []);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.description) {
      const updatedExperience = [...experience, { ...newExperience }];
      setExperience(updatedExperience);
      setNewExperience({ title: '', description: '', duration: '' });
      alert('Experience added! Remember to click "Save Profile" to save permanently.');
    } else {
      alert('Please fill at least title and description');
    }
  };

  const removeExperience = (index) => {
    const updatedExperience = experience.filter((_, i) => i !== index);
    setExperience(updatedExperience);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Profile</h2>
          <p>Please wait while we load your profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-background"></div>
        <div className="profile-header-content">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information and career preferences</p>
          <div className="profile-count">
            <span className="count-number">{userApplications.length}</span> Applied Jobs •{' '}
            <span className="count-number">{user.skills?.length || 0}</span> Skills •{' '}
            <span className="count-number">{experience.length}</span> Experiences
          </div>
        </div>
      </header>

      <div className="quote-section">
        <p className="quote-text">"{currentQuote}"</p>
        <p className="quote-author">- CareerConnect Team</p>
      </div>

      <div className="profile-actions-section">
        <div className="profile-actions">
          <button
            onClick={() => {
              setShowApplications(!showApplications);
              if (!showApplications) fetchApplications();
            }}
            className="applications-btn"
          >
            <i className="fas fa-briefcase"></i>
            Applied Jobs ({userApplications.length})
          </button>
          <button
            onClick={() => setEditing(!editing)}
            disabled={loading}
            className={`edit-profile-btn ${editing ? 'cancel' : 'edit'}`}
          >
            <i className={`fas ${editing ? 'fa-times' : 'fa-edit'}`}></i>
            {editing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {showApplications && (
        <div className="applications-section">
          <div className="section-header">
            <h2>My Applied Jobs</h2>
            <span className="section-badge">{userApplications.length} applications</span>
          </div>
          {userApplications.length === 0 ? (
            <div className="no-applications">
              <div className="no-applications-icon">📝</div>
              <h3>No Job Applications Yet</h3>
              <p>Start applying to jobs to see them here!</p>
              <button
                onClick={() => window.location.href = '/jobs'}
                className="browse-jobs-btn"
              >
                <i className="fas fa-search"></i>
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="applications-grid">
              {userApplications.slice(0, 3).map((app, index) => (
                <div key={index} className="application-card">
                  <div className="application-header">
                    <div className="application-info">
                      <h4 className="job-title">{app.jobTitle}</h4>
                      <p className="company-name">{app.company}</p>
                      <small className="applied-date">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </small>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.notes && (
                    <p className="application-notes">
                      "{app.notes}"
                    </p>
                  )}
                </div>
              ))}
              {userApplications.length > 3 && (
                <button
                  onClick={() => window.location.href = '/applications'}
                  className="view-all-btn"
                >
                  View all {userApplications.length} applied jobs <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="profile-content">
        {editing ? (
          <div className="edit-profile-form">
            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-user"></i> Personal Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Education Level *</label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Self-Taught">Self-Taught</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department/Field</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g., Computer Science, Business Administration"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Experience Level *</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Track *</label>
                  <select
                    name="preferredTrack"
                    value={formData.preferredTrack}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Preferred Track</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-star"></i> Skills & Career Interests</h3>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g., JavaScript, Communication, Design, Project Management"
                    value={formData.skills}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Career Interests (comma separated)</label>
                  <input
                    type="text"
                    name="careerInterests"
                    placeholder="e.g., Frontend Development, Data Analysis, UX Design"
                    value={formData.careerInterests}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-briefcase"></i> Projects & Experience</h3>
              </div>
              <div className="experience-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="Project or Experience Title"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 3 months, Jan 2023 - Present"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    placeholder="Describe your experience, responsibilities, and achievements..."
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                    rows="3"
                    className="form-textarea"
                  />
                </div>
                <button
                  onClick={addExperience}
                  className="add-experience-btn"
                >
                  <i className="fas fa-plus"></i>
                  Add Experience
                </button>
              </div>
              
              <div className="experience-list">
                {experience.length > 0 ? (
                  experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <button
                        onClick={() => removeExperience(index)}
                        className="remove-experience-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <h4 className="experience-title">{exp.title}</h4>
                      {exp.duration && (
                        <span className="experience-duration">{exp.duration}</span>
                      )}
                      <p className="experience-description">{exp.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-experience">
                    <i className="fas fa-inbox"></i>
                    <p>No experiences added yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-file-alt"></i> CV / Additional Notes</h3>
              </div>
              <div className="form-group full-width">
                <textarea
                  name="cvText"
                  placeholder="Paste your CV text, additional notes, career objectives, or anything else you'd like to share..."
                  value={formData.cvText}
                  onChange={handleChange}
                  rows="6"
                  className="form-textarea large"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="save-profile-btn"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Profile
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="view-profile">
            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-user"></i> Personal Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label>Education</label>
                  <p>{user.educationLevel} {user.department && `- ${user.department}`}</p>
                </div>
                <div className="info-item">
                  <label>Experience Level</label>
                  <p>{user.experienceLevel}</p>
                </div>
                <div className="info-item">
                  <label>Preferred Track</label>
                  <p>{user.preferredTrack}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-star"></i> Skills</h3>
              </div>
              <div className="skills-list">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <div className="no-data">
                    <i className="fas fa-star"></i>
                    <p>No skills added yet</p>
                  </div>
                )}
              </div>
            </div>

            {user.careerInterests?.length > 0 && (
              <div className="profile-section">
                <div className="section-header">
                  <h3><i className="fas fa-bullseye"></i> Career Interests</h3>
                </div>
                <div className="interests-list">
                  {user.careerInterests.map((interest, index) => (
                    <span key={index} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-briefcase"></i> Projects & Experience</h3>
              </div>
              <div className="experience-list">
                {user.experience && user.experience.length > 0 ? (
                  user.experience.map((exp, index) => (
                    <div key={index} className="experience-item view">
                      <h4 className="experience-title">{exp.title}</h4>
                      {exp.duration && (
                        <span className="experience-duration">{exp.duration}</span>
                      )}
                      <p className="experience-description">{exp.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <i className="fas fa-briefcase"></i>
                    <p>No projects or experience added yet</p>
                  </div>
                )}
              </div>
            </div>

            {user.cvText && (
              <div className="profile-section">
                <div className="section-header">
                  <h3><i className="fas fa-file-alt"></i> CV Notes</h3>
                </div>
                <div className="cv-text">
                  <p>{user.cvText}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;