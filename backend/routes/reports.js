const express = require('express');
const Report = require('../models/Report');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.post('/upload-photos', upload.array('photos', 5), async (req, res) => {
  try {
    const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      photos: photoPaths
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

router.post('/submit', async (req, res) => {
  try {
    const { description, location, photos, submittedBy } = req.body;
    
    console.log('PHOTOS RECEIVED:', photos);

    if (!submittedBy) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required to submit a report'
      });
    }

    const newReport = new Report({
      description,
      location,
      photos,
      submittedBy: new mongoose.Types.ObjectId(submittedBy)
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