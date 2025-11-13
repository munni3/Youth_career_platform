const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  remote: { type: Boolean, default: false },
  requiredSkills: [String],
  experienceLevel: String,
  jobType: { type: String, enum: ['Internship', 'Part-time', 'Full-time', 'Freelance','Contract'] },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);