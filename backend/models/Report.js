const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  wasteType: {
    type: String,
    default: 'general'
  },
  photo: {
    type: String
  },
  status: {
    type: String,
    default: 'submitted',
    enum: ['submitted', 'in-progress', 'completed']
  },
  priority: {
    type: String,
    default: 'pending',  // ← CHANGED FROM 'medium' TO 'pending'
    enum: ['pending', 'low', 'medium', 'high', 'critical']  // ← ADDED ENUM FOR CLARITY
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);