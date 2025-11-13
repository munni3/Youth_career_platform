import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Resources.css';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [enrolling, setEnrolling] = useState({});
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [user, setUser] = useState(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  // Motivational quotes for learning
  const motivationalQuotes = [
    "The beautiful thing about learning is that no one can take it away from you.",
    "Education is the most powerful weapon which you can use to change the world.",
    "Learning never exhausts the mind. Keep growing every day!",
    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    "Your future is created by what you do today, not tomorrow. Start learning now!"
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchUserEnrollments();
    }
    fetchResources();
    
    // Set initial quote
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Rotate quotes every 10 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 10000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resources');
      console.log('Resources data:', response.data);
      const resourcesData = response.data || [];
      setResources(resourcesData);
      
      // Calculate total enrollments properly
      calculateTotalEnrollments(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all enrollments to get accurate count
  const fetchTotalEnrollments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resources/enrollments/all');
      setTotalEnrollments(response.data.totalEnrollments || 0);
    } catch (error) {
      console.error('Error fetching total enrollments:', error);
      // Fallback to calculating from resources data
      calculateTotalEnrollments(resources);
    }
  };

  // Calculate total enrollments from resources data
  const calculateTotalEnrollments = (resourcesData) => {
    const total = resourcesData.reduce((sum, resource) => {
      return sum + (resource.enrolledCount || 0);
    }, 0);
    setTotalEnrollments(total);
  };

  const fetchUserEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/resources/my-enrollments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const validEnrollments = (response.data || []).filter(
        (e) => e && e.resourceId && (e.resourceId._id || typeof e.resourceId === 'string')
      );

      setUserEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setUserEnrollments([]);
    }
  };

  const isUserEnrolled = (resourceId) => {
    if (!Array.isArray(userEnrollments) || userEnrollments.length === 0) return false;

    return userEnrollments.some((enrollment) => {
      const res = enrollment?.resourceId;
      if (!res) return false;
      return res._id === resourceId || res === resourceId;
    });
  };

  const categories = ['All', ...new Set(resources.flatMap((r) => r.relatedSkills || []))];

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'All' || resource.relatedSkills?.includes(selectedCategory);
    return matchesCategory;
  });

  const handleEnroll = async (resourceId) => {
    if (enrolling[resourceId] || !user) return;

    setEnrolling((prev) => ({ ...prev, [resourceId]: true }));

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/resources/${resourceId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update both the resource count and total enrollments
      setResources((prev) =>
        prev.map((res) =>
          res._id === resourceId
            ? { ...res, enrolledCount: (res.enrolledCount || 0) + 1 }
            : res
        )
      );

      // Update total enrollments
      setTotalEnrollments(prev => prev + 1);

      await fetchUserEnrollments();
    } catch (error) {
      if (error.response?.status === 400) {
        await fetchUserEnrollments();
      } else if (error.response?.status === 401) {
        alert('Please log in to enroll in resources');
      } else {
        alert('Failed to enroll. Please try again.');
        console.error(error);
      }
    } finally {
      setEnrolling((prev) => ({ ...prev, [resourceId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="resources-container">
        <div className="resources-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Learning Resources</h2>
          <p>Discovering amazing learning opportunities for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* Header Section */}
      <header className="resources-header">
        <div className="header-background"></div>
        <div className="resources-header-content">
          <h1 className="resources-title">Learning Resources</h1>
          <p className="resources-subtitle">Curated resources to boost your career skills and knowledge</p>
          <div className="resources-count">
            <span className="count-number">{filteredResources.length}</span> Resources Available •{' '}
            <span className="count-number">{totalEnrollments}</span> Total Enrollments
          </div>
        </div>
      </header>

      {/* Motivational Quote */}
      <div className="quote-section">
        <p className="quote-text">"{currentQuote}"</p>
        <p className="quote-author">- CareerConnect Team</p>
      </div>

      {/* Category Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filter by Skill</h3>
          <button 
            onClick={() => setSelectedCategory('All')}
            className="clear-filters-btn"
          >
            <i className="fas fa-times"></i>
            Clear Filter
          </button>
        </div>
        
        <div className="skills-filter">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`skill-filter-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-content">
        {filteredResources.length === 0 ? (
          <div className="no-resources-found">
            <div className="no-resources-icon">📚</div>
            <h3>No Learning Resources Found</h3>
            <p>
              {selectedCategory !== 'All'
                ? "Try selecting a different skill category or browse all resources."
                : "No resources available at the moment. Check back later!"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="resources-grid-header">
              <h2>Available Resources</h2>
              <span className="resources-count-badge">{filteredResources.length} resources • {totalEnrollments} total enrollments</span>
            </div>
            
            <div className="resources-grid">
              {filteredResources.map((resource) => (
                <div 
                  key={resource._id} 
                  className={`resource-card ${resource.cost === 'Free' ? 'free' : 'paid'}`}
                >
                  {/* Free Badge */}
                  {resource.cost === 'Free' && (
                    <div className="free-badge">
                      <i className="fas fa-gift"></i>
                      FREE
                    </div>
                  )}

                  {/* Premium Badge */}
                  {resource.cost !== 'Free' && (
                    <div className="premium-badge">
                      <i className="fas fa-crown"></i>
                      PREMIUM
                    </div>
                  )}

                  <div className="resource-header">
                    <h3 className="resource-title">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        {resource.title}
                      </a>
                    </h3>
                    <div className="resource-platform">
                      <i className="fas fa-desktop"></i>
                      {resource.platform || 'Various Platforms'}
                    </div>
                  </div>

                  <div className="resource-meta">
                    <span className={`resource-cost ${resource.cost === 'Free' ? 'free' : 'paid'}`}>
                      <i className="fas fa-tag"></i>
                      {resource.cost || 'Unknown'}
                    </span>
                    <span className="resource-enrolled">
                      <i className="fas fa-users"></i>
                      {resource.enrolledCount || 0} enrolled
                    </span>
                  </div>

                  <div className="resource-skills">
                    <label>Related Skills:</label>
                    <div className="skills-list">
                      {resource.relatedSkills?.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      )) || <span className="skill-tag">General</span>}
                    </div>
                  </div>

                  {resource.description && (
                    <p className="resource-description">{resource.description}</p>
                  )}

                  <div className="resource-actions">
                    {user ? (
                      <button
                        onClick={() => handleEnroll(resource._id)}
                        disabled={enrolling[resource._id] || isUserEnrolled(resource._id)}
                        className={`enroll-btn ${isUserEnrolled(resource._id) ? 'enrolled' : ''}`}
                      >
                        {enrolling[resource._id] ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Enrolling...
                          </>
                        ) : isUserEnrolled(resource._id) ? (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Enrolled
                          </>
                        ) : (
                          <>
                            <i className="fas fa-rocket"></i>
                            Enroll Now
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="login-prompt">
                        <i className="fas fa-info-circle"></i>
                        Log in to enroll in this resource
                      </div>
                    )}
                    
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-btn"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Preview
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;