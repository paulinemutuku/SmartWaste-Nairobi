const mongoose = require('mongoose');

const CollectorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  zone: { 
    type: String, 
    required: true 
  },
  assignedClusters: [{ 
    type: String 
  }],
  assignedRoutes: [{
    routeId: String,
    clusterId: String,
    clusterName: String,
    clusterLocation: String, 
    gpsCoordinates: [Number], 
    assignedDate: Date,
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    completedAt: Date,
    reportCount: Number,
    verifiedPhotos: [String],
    notes: String,
    pickupLocation: String, 
    destinationCoordinates: [Number], 
    estimatedTime: String, 
    distance: String 
  }],
  activeAccount: { 
    type: Boolean, 
    default: true 
  },
  performance: {
    reportsCompleted: { 
      type: Number, 
      default: 0 
    },
    avgResponseTime: { 
      type: Number, 
      default: 0 
    },
    rating: { 
      type: Number, 
      default: 0 
    },
    routesCompleted: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Collector', CollectorSchema);