const express = require('express');
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const router = express.Router();

// GET all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE resource (protected - admin only)
router.post('/', auth, async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE resource (protected - admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE resource (protected - admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ENROLL IN RESOURCE
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment enrolled count
    resource.enrolledCount += 1;
    await resource.save();

    res.json({ 
      message: 'Successfully enrolled in resource',
      enrolledCount: resource.enrolledCount 
    });
  } catch (error) {
    console.error('Error enrolling in resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;