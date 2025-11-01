const express = require('express');
const Report = require('../models/Report');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/submit', async (req, res) => {
  try {
    console.log('REQUEST BODY:', req.body);
    
    const { description, location, latitude, longitude, wasteType, userId } = req.body;
    
    if (!description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Description and user ID are required'
      });
    }

    const newReport = new Report({
      description,
      location: location || 'Nairobi, Kenya',
      latitude: latitude || -1.2921,
      longitude: longitude || 36.8219,
      wasteType: wasteType || 'general',
      photo: null, // No photo for now
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
    console.log('SUBMISSION ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
});

router.post('/upload-photos', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Photo upload endpoint - not implemented yet',
      photos: []
    });
  } catch (error) {
    console.log('PHOTO UPLOAD ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error uploading photos',
      error: error.message
    });
  }
});

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