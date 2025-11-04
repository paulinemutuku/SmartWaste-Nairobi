const express = require('express');
const Report = require('../models/Report');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Submit report with photo
router.post('/submit', upload.single('photo'), async (req, res) => {
  try {
    const { description, location, latitude, longitude, wasteType, userId } = req.body;
    
    if (!description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Description and user ID are required'
      });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const newReport = new Report({
      description,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      wasteType: wasteType || 'general',
      photo: photoPath,
      submittedBy: new mongoose.Types.ObjectId(userId),
      status: 'submitted',
      priority: 'medium'
    });
    
    const savedReport = await newReport.save();
    
    res.json({
      success: true,
      message: 'Report submitted successfully!',
      report: savedReport
    });
    
  } catch (error) {
    console.log('SUBMISSION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
});

// Get all reports
router.get('/all', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reports.length,
      reports: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

// Get user reports
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const reports = await Report.find({ 
      submittedBy: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reports.length,
      reports: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reports',
      error: error.message
    });
  }
});

module.exports = router;