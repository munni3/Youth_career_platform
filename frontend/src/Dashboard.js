import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Dashboard = ({ onApplicationUpdate }) => {
  const [user, setUser] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState('');
  const [userApplications, setUserApplications] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [enrolling, setEnrolling] = useState({});

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const enhancedMatching = useCallback((jobs, resources, userSkills = [], userTrack = '') => {
    const safeUserSkills = (userSkills || []).map(s => String(s).toLowerCase());
    const lowerTrack = String(userTrack || '').toLowerCase();

    const jobMatches = jobs
      .map(job => {
        const jobSkills = (job.requiredSkills || []).map(s => String(s).toLowerCase());
        const matchingSkills = jobSkills.filter(skill =>
          safeUserSkills.some(userSkill =>
            userSkill.includes(skill) || skill.includes(userSkill)
          )
        );

        const skillScore = matchingSkills.length;
        const trackBonus = lowerTrack && job.title?.toLowerCase().includes(lowerTrack) ? 2 : 0;
        const totalScore = skillScore + trackBonus;
        const matchPercentage =
          jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0;

        return {
          ...job,
          matchingSkills,
          matchScore: totalScore,
          matchPercentage
        };
      })
      .filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    const resourceMatches = resources
      .filter(resource => {
        const resourceSkills = (resource.relatedSkills || []).map(s => String(s).toLowerCase());
        return resourceSkills.some(skill =>
          safeUserSkills.some(userSkill =>
            userSkill.includes(skill) || skill.includes(userSkill)
          )
        );
      })
      .slice(0, 5);

    return { jobMatches, resourceMatches };
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserApplications(response.data);
      if (onApplicationUpdate) onApplicationUpdate();
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [API_BASE, onApplicationUpdate]);

  const fetchUserEnrollments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/resources/my-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out any null or malformed enrollments
      const validEnrollments = (response.data || []).filter(e => e && e.resourceId);
      setUserEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }, [API_BASE]);

  const fetchRecommendations = useCallback(
    async (user) => {
      try {
        const [jobsResponse, resourcesResponse] = await Promise.all([
          axios.get(`${API_BASE}/jobs`),
          axios.get(`${API_BASE}/resources`)
        ]);

        const { jobMatches, resourceMatches } = enhancedMatching(
          jobsResponse.data,
          resourcesResponse.data,
          user.skills || [],
          user.preferredTrack
        );

        setRecommendedJobs(jobMatches);
        setRecommendedResources(resourceMatches);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
      }
    },
    [API_BASE, enhancedMatching]
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchRecommendations(userObj);
      fetchApplications();
      fetchUserEnrollments();
    }
  }, [fetchRecommendations, fetchApplications, fetchUserEnrollments]);

  const handleApply = (job) => {
    setApplyingJob(job);
  };

  const submitApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/applications/apply`,
        {
          jobId: applyingJob._id,
          notes: applicationNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Application submitted successfully!');
      setApplyingJob(null);
      setApplicationNotes('');
      fetchApplications();
      if (onApplicationUpdate) onApplicationUpdate();
    } catch (error) {
      // SILENTLY HANDLE "ALREADY APPLIED" — NO POPUP
      setApplyingJob(null);
      setApplicationNotes('');
      fetchApplications();
      if (onApplicationUpdate) onApplicationUpdate();
    }
  };

  // ENROLL BUTTON HANDLER
  const handleEnroll = async (resourceId) => {
    if (enrolling[resourceId]) return;

    setEnrolling(prev => ({ ...prev, [resourceId]: true }));

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/resources/${resourceId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update enrollment count locally
      setRecommendedResources(prev => prev.map(res =>
        res._id === resourceId
          ? { ...res, enrolledCount: (res.enrolledCount || 0) + 1 }
          : res
      ));

      // Refresh enrollments
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
      setEnrolling(prev => ({ ...prev, [resourceId]: false }));
    }
  };

  // ✅ FIXED: Prevent null reading errors
  const isUserEnrolled = (resourceId) => {
    return userEnrollments.some(enrollment =>
      enrollment?.resourceId?._id === resourceId ||
      enrollment?.resourceId === resourceId
    );
  };

  const calculateProfileComplete = (user) => {
    if (!user) return 0;

    let score = 0;
    const fields = {
      name: 15,
      email: 10,
      educationLevel: 15,
      experienceLevel: 15,
      preferredTrack: 15,
      skills: 20,
      careerInterests: 10
    };

    Object.keys(fields).forEach(field => {
      if (user[field]) {
        if (Array.isArray(user[field]) && user[field].length > 0) {
          score += fields[field];
        } else if (typeof user[field] === 'string' && user[field].trim()) {
          score += fields[field];
        }
      }
    });

    return Math.min(100, score);
  };

  // CHECK IF JOB IS ALREADY APPLIED
  const isJobApplied = (jobId) => {
    return userApplications.some(app => app.jobId === jobId);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Dashboard</h1>
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Dashboard</h1>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  const profileComplete = calculateProfileComplete(user);
  const applicationStats = {
    total: userApplications.length,
    inProgress: userApplications.filter(app =>
      ['Applied', 'Under Review', 'Interview'].includes(app.status)
    ).length,
    accepted: userApplications.filter(app => app.status === 'Accepted').length,
    rejected: userApplications.filter(app => app.status === 'Rejected').length
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome back, {user.name}!</h1>
      <p>Here are your personalized recommendations</p>

      {/* User Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}
      >
        <div style={{ padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{user.skills?.length || 0}</h3>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Skills</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{recommendedJobs.length}</h3>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Job Matches</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{applicationStats.total}</h3>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Applications</p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: profileComplete === 100 ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{profileComplete}%</h3>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Profile Complete</p>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileComplete < 100 && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          <strong>Complete your profile!</strong> Add more skills and career interests to get better recommendations.
          <button
            onClick={() => (window.location.href = '/profile')}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Job Recommendations */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Recommended Jobs ({recommendedJobs.length})</h2>
        {recommendedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No job recommendations yet</h3>
            <p>Add more skills to your profile to see personalized job matches!</p>
          </div>
        ) : (
          recommendedJobs.map(job => (
            <div
              key={job._id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                borderLeft: '4px solid #007bff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    {job.matchScore} skill{job.matchScore !== 1 ? 's' : ''} match ({job.matchPercentage}%)
                  </div>

                  <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>{job.title}</h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>{job.company}</strong> • {job.location} {job.remote && '• Remote'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Matches your skills:</strong> {job.matchingSkills.join(', ')}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Level:</strong> {job.experienceLevel} • <strong>Type:</strong> {job.jobType}
                  </p>
                  {job.description && (
                    <p style={{ margin: '5px 0', fontStyle: 'italic' }}>{job.description}</p>
                  )}
                </div>

                {isJobApplied(job._id) ? (
                  <button
                    disabled
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginLeft: '15px',
                      opacity: 0.8
                    }}
                  >
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginLeft: '15px'
                    }}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resource Recommendations */}
      <div>
        <h2>Recommended Learning Resources ({recommendedResources.length})</h2>
        {recommendedResources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No resource recommendations yet</h3>
            <p>Add more skills to your profile to see personalized learning resources!</p>
          </div>
        ) : (
          recommendedResources.map(resource => (
            <div
              key={resource._id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none' }}
                >
                  {resource.title}
                </a>
              </h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Platform:</strong> {resource.platform} •
                <strong> Cost:</strong>{' '}
                <span
                  style={{
                    color: resource.cost === 'Free' ? 'green' : 'orange',
                    fontWeight: 'bold'
                  }}
                >
                  {resource.cost}
                </span>
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Skills:</strong> {resource.relatedSkills?.join(', ')}
              </p>
              {resource.description && (
                <p style={{ margin: '5px 0', fontStyle: 'italic' }}>{resource.description}</p>
              )}

              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => handleEnroll(resource._id)}
                  disabled={enrolling[resource._id] || isUserEnrolled(resource._id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isUserEnrolled(resource._id) ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (enrolling[resource._id] || isUserEnrolled(resource._id)) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {enrolling[resource._id] ? 'Enrolling...' :
                    isUserEnrolled(resource._id) ? '✅ Enrolled' : 'Enroll Now'}
                </button>
                <span style={{ color: '#555', fontSize: '14px' }}>
                  <strong>{resource.enrolledCount || 0}</strong> people enrolled
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Modal */}
      {applyingJob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '500px'
            }}
          >
            <h3>Apply for {applyingJob.title}</h3>
            <p><strong>Company:</strong> {applyingJob.company}</p>
            <p><strong>Match:</strong> {applyingJob.matchScore} skills matched ({applyingJob.matchPercentage}%)</p>

            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Additional Notes (Optional):
              </label>
              <textarea
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                placeholder="Why are you interested in this position? What makes you a good fit?"
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setApplyingJob(null);
                  setApplicationNotes('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #dc3545',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
