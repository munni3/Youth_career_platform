const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile - COMPLETELY FIXED
router.put('/', auth, async (req, res) => {
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

    // Use findById and save() instead of findByIdAndUpdate for better array handling
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update all fields
    user.name = name;
    user.educationLevel = educationLevel;
    user.department = department;
    user.experienceLevel = experienceLevel;
    user.preferredTrack = preferredTrack;
    user.cvText = cvText;
    
    // Handle arrays properly
    user.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    user.careerInterests = Array.isArray(careerInterests) ? careerInterests : careerInterests.split(',').map(interest => interest.trim()).filter(interest => interest);
    
    // CRITICAL FIX: Properly handle experience array
    user.experience = Array.isArray(experience) ? experience : [];

    await user.save();

    // Return user without password
    const userWithoutPassword = await User.findById(req.user.id).select('-password');
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add experience (optional - you can remove this if using the main update)
router.post('/experience', auth, async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const user = await User.findById(req.user.id);
    
    user.experience.push({ title, description, duration });
    await user.save();
    
    res.json(user.experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;