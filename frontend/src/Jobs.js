import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Jobs.css';

const Jobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('personalized');
  const [activeCategory, setActiveCategory] = useState('All Jobs');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');

  // Motivational quotes
  const motivationalQuotes = [
    "Your next career breakthrough is just one application away!",
    "Great jobs don't happen by accident - they're created by people like you.",
    "The perfect job is waiting for your unique skills and passion.",
    "Every expert was once a beginner. Your journey starts here.",
    "Opportunities don't happen, you create them. Start today!"
  ];

  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
    fetchJobs();
    
    // Rotate quotes every 8 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 8000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      const jobsData = Array.isArray(response.data) ? response.data : [];
      setAllJobs(jobsData);
      
      if (user) {
        applyPersonalizedFilter(jobsData);
      } else {
        setDisplayedJobs(jobsData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Enhanced sample data with more jobs
      const sampleJobs = [
        {
          _id: '1',
          title: 'Frontend Developer',
          company: 'Tech Solutions Inc',
          location: 'Remote',
          remote: true,
          requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
          experienceLevel: 'Junior',
          jobType: 'Full-time',
          description: 'Build and maintain dynamic user interfaces using React. Collaborate with design and backend teams to create seamless user experiences.',
          featured: true
        },
        {
          _id: '2',
          title: 'Data Analyst Intern',
          company: 'Data Insights Co.',
          location: 'Chattogram',
          remote: false,
          requiredSkills: ['Python', 'SQL', 'Statistics', 'Data Visualization'],
          experienceLevel: 'Fresher',
          jobType: 'Internship',
          description: 'Assist in analyzing large datasets and generating insights. Create reports and dashboards to help drive business decisions.',
          featured: false
        },
        {
          _id: '3',
          title: 'Backend Developer',
          company: 'Cloudify Labs',
          location: 'Dhaka',
          remote: true,
          requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
          experienceLevel: 'Mid-level',
          jobType: 'Full-time',
          description: 'Develop and maintain scalable backend APIs. Work on database design, performance optimization, and system architecture.',
          featured: true
        },
        {
          _id: '4',
          title: 'UI/UX Designer',
          company: 'Creative Minds Studio',
          location: 'Dhaka',
          remote: false,
          requiredSkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
          experienceLevel: 'Mid Level',
          jobType: 'Full-time',
          description: 'Design beautiful and intuitive user interfaces for web and mobile applications.',
          featured: false
        },
        {
          _id: '5',
          title: 'Marketing Data Specialist',
          company: 'GrowthWave',
          location: 'Remote',
          remote: true,
          requiredSkills: ['Google Analytics', 'Python', 'Power BI'],
          experienceLevel: 'Junior',
          jobType: 'Full-time',
          description: 'Analyze marketing data and help improve campaigns.',
          featured: false
        }
      ];
      setAllJobs(sampleJobs);
      setDisplayedJobs(sampleJobs);
      setLoading(false);
    }
  };

  // Apply personalized filtering based on user skills
  const applyPersonalizedFilter = (jobs = allJobs) => {
    if (!user || !user.skills || user.skills.length === 0) {
      setDisplayedJobs(jobs);
      return;
    }

    const userSkills = user.skills.map(skill => skill.toLowerCase());
    
    const personalizedJobs = jobs.map(job => {
      const jobSkills = job.requiredSkills || [];
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          skill.toLowerCase().includes(userSkill) ||
          userSkill.includes(skill.toLowerCase())
        )
      );
      
      return {
        ...job,
        matchingSkills,
        matchScore: matchingSkills.length,
        matchPercentage: jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0
      };
    })
    .filter(job => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

    setDisplayedJobs(personalizedJobs);
  };

  // Apply regular filters (search, location, job type)
  const applyRegularFilters = (jobs = allJobs) => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.requiredSkills?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedJobType) {
      filtered = filtered.filter(job => job.jobType === selectedJobType);
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter(job =>
        selectedSkills.every(skill => 
          job.requiredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setDisplayedJobs(filtered);
  };

  // Toggle between personalized and all jobs view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'personalized' && user) {
      applyPersonalizedFilter();
    } else {
      applyRegularFilters();
    }
  };

  // Get unique values for filters
  const allSkills = [...new Set(allJobs.flatMap(job => job.requiredSkills || []))];
  const allLocations = [...new Set(allJobs.map(job => job.location).filter(Boolean))];
  const allJobTypes = [...new Set(allJobs.map(job => job.jobType).filter(Boolean))];

  const toggleSkill = (skill) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    
    // Apply filters immediately when skills change
    if (viewMode === 'all') {
      const filtered = allJobs.filter(job =>
        newSkills.length === 0 || newSkills.every(skill => 
          job.requiredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
      setDisplayedJobs(filtered);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedLocation('');
    setSelectedJobType('');
    if (viewMode === 'all') {
      setDisplayedJobs(allJobs);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (viewMode === 'all') {
      applyRegularFilters();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (viewMode === 'all') {
      applyRegularFilters();
    }
  };

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="jobs-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Opportunities</h2>
          <p>Discovering amazing career paths for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-container">
        <div className="jobs-error">
          <div className="error-icon">⚠️</div>
          <h2>Connection Issue</h2>
          <p>{error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      {/* Header Section */}
      <header className="jobs-header">
        <div className="header-background"></div>
        <div className="jobs-header-content">
          <h1 className="jobs-title">Career Opportunities</h1>
          <p className="jobs-subtitle">Discover your next career move with our handpicked positions</p>
          <div className="jobs-count">
            <span className="count-number">{displayedJobs.length}</span> Open Positions Available
          </div>
        </div>
      </header>

      {/* Motivational Quote */}
      <div className="quote-section">
        <p className="quote-text">"{currentQuote}"</p>
        <p className="quote-author">- CareerConnect Team</p>
      </div>
      {/* Search Section */}
      <div className="search-section">
        <form className="search-container" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
            Search
          </button>
        </form>
      </div>

      {/* View Mode Toggle */}
      {user && (
        <div className="view-mode-section">
          <div className="view-mode-toggle">
            <button
              onClick={() => toggleViewMode('personalized')}
              className={`view-mode-btn ${viewMode === 'personalized' ? 'active' : ''}`}
            >
              <i className="fas fa-user-check"></i>
              For You
            </button>
            <button
              onClick={() => toggleViewMode('all')}
              className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
            >
              <i className="fas fa-list"></i>
              All Jobs
            </button>
          </div>
          
          {viewMode === 'personalized' && (
            <div className="personalized-info">
              <i className="fas fa-lightbulb"></i>
              Showing jobs matching your skills: <strong>{user.skills?.join(', ') || 'No skills added'}</strong>
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      {viewMode === 'all' && (
        <div className="filters-section">
          <div className="filters-header">
            <h3>Filter Opportunities</h3>
            <button onClick={clearFilters} className="clear-filters-btn">
              <i className="fas fa-times"></i>
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Skills Filter */}
            <div className="filter-group">
              <label>Skills</label>
              <div className="skills-filter">
                {allSkills.slice(0, 6).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`skill-filter-btn ${selectedSkills.includes(skill) ? 'active' : ''}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label>Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  applyRegularFilters();
                }}
                className="location-select"
              >
                <option value="">All Locations</option>
                {allLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div className="filter-group">
              <label>Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => {
                  setSelectedJobType(e.target.value);
                  applyRegularFilters();
                }}
                className="job-type-select"
              >
                <option value="">All Types</option>
                {allJobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="jobs-content">
        {displayedJobs.length === 0 ? (
          <div className="no-jobs-found">
            <div className="no-jobs-icon">🔍</div>
            <h3>No Opportunities Found</h3>
            <p>
              {viewMode === 'personalized' 
                ? "Try adding more skills to your profile or browse all available positions."
                : "Adjust your search criteria or try different filters to find matching jobs."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="jobs-grid-header">
              <h2>Available Positions</h2>
              <span className="jobs-count-badge">{displayedJobs.length} jobs</span>
            </div>
            
            <div className="jobs-grid">
              {displayedJobs.map(job => (
                <div 
                  key={job._id} 
                  className={`job-card ${job.featured ? 'featured' : ''} ${job.remote ? 'remote' : ''}`}
                >
                  {job.featured && <div className="featured-badge">Featured</div>}
                  
                  {/* Match Score for Personalized View */}
                  {viewMode === 'personalized' && job.matchScore > 0 && (
                    <div className="match-badge">
                      <i className="fas fa-star"></i>
                      {job.matchScore} skill match{job.matchScore !== 1 ? 'es' : ''} ({job.matchPercentage}%)
                    </div>
                  )}

                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-company">
                      <i className="fas fa-building"></i>
                      {job.company}
                    </div>
                  </div>

                  <div className="job-meta">
                    <div className="meta-row">
                      <span className="job-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      {job.remote && (
                        <span className="remote-badge">
                          <i className="fas fa-wifi"></i>
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="meta-row">
                      <span className="job-level">{job.experienceLevel}</span>
                      <span className="job-type">{job.jobType}</span>
                    </div>
                  </div>

                  <div className="job-skills">
                    <label>Required Skills:</label>
                    <div className="skills-list">
                      {job.requiredSkills?.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <p className="job-description">{job.description}</p>

                  {/* Matching Skills Highlight */}
                  {viewMode === 'personalized' && job.matchingSkills && job.matchingSkills.length > 0 && (
                    <div className="matching-skills">
                      <i className="fas fa-check-circle"></i>
                      <strong>Matches your skills:</strong> {job.matchingSkills.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;