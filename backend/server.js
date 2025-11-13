const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
})
.catch((error) => {
  console.log('❌ MongoDB connection error:', error.message);
});

// Import models
const Job = require('./models/Job');
const Resource = require('./models/Resource');
const User = require('./models/User');

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Test route
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    message: '🎯 Youth Career Platform API is running!',
    version: '1.0',
    database: dbStatus,
    features: ['Authentication', 'Job Listings', 'User Profiles', 'Skill Matching', 'Learning Resources', 'Job Applications', 'Resource Enrollments']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toLocaleString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// AUTHENTICATION ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      educationLevel, 
      department, 
      experienceLevel, 
      preferredTrack, 
      skills,
      cvText,
      careerInterests 
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      educationLevel,
      department,
      experienceLevel,
      preferredTrack,
      skills: skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
      careerInterests: careerInterests ? careerInterests.split(',').map(interest => interest.trim()).filter(interest => interest) : [],
      cvText: cvText || '',
      experience: []
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        educationLevel: user.educationLevel,
        department: user.department,
        experienceLevel: user.experienceLevel,
        preferredTrack: user.preferredTrack,
        skills: user.skills,
        careerInterests: user.careerInterests,
        cvText: user.cvText
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        educationLevel: user.educationLevel,
        department: user.department,
        experienceLevel: user.experienceLevel,
        preferredTrack: user.preferredTrack,
        skills: user.skills,
        careerInterests: user.careerInterests,
        cvText: user.cvText
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROFILE ROUTES

// Get user profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const {
      name,
      educationLevel,
      department,
      experienceLevel,
      preferredTrack,
      skills,
      careerInterests,
      cvText,
      experience
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        educationLevel,
        department,
        experienceLevel,
        preferredTrack,
        skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        careerInterests: Array.isArray(careerInterests) ? careerInterests : careerInterests.split(',').map(interest => interest.trim()).filter(interest => interest),
        cvText,
        experience: experience || []
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// APPLICATIONS ROUTES

// Apply for a job
app.post('/api/applications/apply', auth, async (req, res) => {
  try {
    const { jobId, notes } = req.body;
    const user = await User.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = user.applications.find(app => app.jobId.toString() === jobId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add to applications
    user.applications.push({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      notes: notes || '',
      status: 'Applied'
    });

    await user.save();

    res.json({ 
      message: 'Application submitted successfully!', 
      application: user.applications[user.applications.length - 1] 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's applications
app.get('/api/applications/my-applications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.applications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
app.put('/api/applications/:applicationId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);
    
    const application = user.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await user.save();

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// JOBS ROUTE - Get all jobs from MongoDB
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    console.error('❌ Error fetching jobs from database:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs from database',
      details: error.message 
    });
  }
});

// RESOURCES ROUTE - Get all resources from MongoDB
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await Resource.find({});
    res.json(resources);
  } catch (error) {
    console.error('❌ Error fetching resources from database:', error);
    res.status(500).json({ 
      error: 'Failed to fetch resources from database',
      details: error.message 
    });
  }
});

// ENROLLMENT ROUTES

// Enroll in a resource
app.post('/api/resources/:id/enroll', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user already enrolled
    const alreadyEnrolled = user.resourceEnrollments.some(
      enrollment => enrollment.resourceId.toString() === req.params.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this resource' });
    }

    // Add to user's enrollments
    user.resourceEnrollments.push({
      resourceId: resource._id
    });

    // Increment enrolled count
    resource.enrolledCount = (resource.enrolledCount || 0) + 1;
    
    await Promise.all([user.save(), resource.save()]);

    res.json({ 
      message: 'Successfully enrolled in resource',
      enrolledCount: resource.enrolledCount 
    });
  } catch (error) {
    console.error('Error enrolling in resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's resource enrollments
app.get('/api/resources/my-enrollments', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('resourceEnrollments.resourceId');
    res.json(user.resourceEnrollments || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RECOMMENDATIONS ROUTE - Basic matching logic
app.get('/api/recommendations', auth, async (req, res) => {
  try {
    const user = req.user;

    // Get all jobs and resources
    const [jobs, resources] = await Promise.all([
      Job.find({}),
      Resource.find({})
    ]);

    // Basic matching logic
    const userSkills = user.skills || [];
    const userTrack = user.preferredTrack;

    // Match jobs
    const recommendedJobs = jobs.filter(job => {
      const jobSkills = job.requiredSkills || [];
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      return matchingSkills.length > 0;
    }).map(job => {
      const jobSkills = job.requiredSkills || [];
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      return {
        ...job.toObject(),
        matchingSkills,
        matchScore: matchingSkills.length,
        matchPercentage: jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    // Match resources
    const recommendedResources = resources.filter(resource => {
      const resourceSkills = resource.relatedSkills || [];
      return resourceSkills.some(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
    }).slice(0, 5);

    res.json({
      jobs: recommendedJobs,
      resources: recommendedResources,
      userSkills,
      userTrack
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`👷 Jobs endpoint: http://localhost:${PORT}/api/jobs`);
  console.log(`📚 Resources endpoint: http://localhost:${PORT}/api/resources`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile endpoint: http://localhost:${PORT}/api/profile`);
  console.log(`📋 Applications endpoint: http://localhost:${PORT}/api/applications`);
  console.log(`🎯 Recommendations endpoint: http://localhost:${PORT}/api/recommendations`);
  console.log(`📝 Enrollment endpoints: http://localhost:${PORT}/api/resources/:id/enroll`);
});