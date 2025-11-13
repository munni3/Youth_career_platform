const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  educationLevel: {
    type: String,
    required: true,
    enum: ['High School', 'Undergraduate', 'Graduate', 'Bootcamp', 'Self-Taught']
  },
  department: {
    type: String,
    trim: true
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['Fresher', 'Junior', 'Mid', 'Senior']
  },
  preferredTrack: {
    type: String,
    required: true,
    enum: ['Web Development', 'Data Science', 'Design', 'Marketing', 'Business', 'Other']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    description: String,
    duration: String
  }],
  careerInterests: [{
    type: String,
    trim: true
  }],
  cvText: {
    type: String,
    trim: true
  },
  
  applications: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    jobTitle: String,
    company: String,
    appliedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['Applied', 'Under Review', 'Interview', 'Rejected', 'Accepted'],
      default: 'Applied'
    },
    notes: String
  }],
 
  resourceEnrollments: [{
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    enrolledAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);