const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const router = express.Router();


router.post('/apply', auth, async (req, res) => {
  try {
    const { jobId, notes } = req.body;
    const user = await User.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    
    const alreadyApplied = user.applications.find(app => app.jobId.toString() === jobId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

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


router.get('/my-applications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.applications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:applicationId/status', auth, async (req, res) => {
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

module.exports = router;