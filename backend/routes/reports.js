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

router.post('/submit', async (req, res) => {
  try {
    const { description, location, photos } = req.body;
    const newReport = new Report({
      description,
      location,
      photos,
      submittedBy: new mongoose.Types.ObjectId()
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

router.post('/submit-with-photos', upload.array('photos', 5), async (req, res) => {
  try {
    const { description, location, submittedBy } = req.body;
    
    const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const newReport = new Report({
      description,
      location: JSON.parse(location),
      photos: photoPaths,
      submittedBy: submittedBy ? new mongoose.Types.ObjectId(submittedBy) : new mongoose.Types.ObjectId()
    });
    
    const savedReport = await newReport.save();
    
    res.json({
      success: true,
      message: 'Report submitted with photos!',
      report: savedReport
    });
  } catch (error) {
    console.log('PHOTO UPLOAD ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting report with photos',
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

module.exports = router;