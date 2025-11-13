const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: String,
  url: String,
  relatedSkills: [String],
  cost: { type: String, enum: ['Free', 'Paid'] },
  description: String,
  enrolledCount: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);