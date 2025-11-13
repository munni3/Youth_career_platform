const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
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

module.exports = router;