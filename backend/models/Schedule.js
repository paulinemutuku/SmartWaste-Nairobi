const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  clusterId: { type: String, required: true },
  clusterName: { type: String, required: true },
  collectorId: { type: String, required: true },
  collectorName: { type: String, required: true },
  date: { type: Date, required: true },
  reportCount: { type: Number, required: true },
  status: { type: String, default: 'scheduled', enum: ['scheduled', 'in-progress', 'completed'] }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);