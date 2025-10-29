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
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Collector', CollectorSchema);