const express = require('express');
const Report = require('../models/Report');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/submit', async (req, res) => {
  try {
    console.log('📨 Received request with content-type:', req.headers['content-type']);
    
    let description, location, latitude, longitude, wasteType, userId, photo, photos;

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      ({ description, location, latitude, longitude, wasteType, userId, photo, photos, priority } = req.body);
      console.log('📝 Processing as JSON data');
      console.log('📸 Photos received:', photos);
    } else {
      ({ description, location, latitude, longitude, wasteType, userId } = req.body);
      console.log('📝 Processing as FormData');
    }
    
    if (!description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Description and user ID are required'
      });
    }

    // Handle single photo (backward compatibility) and multiple photos
    const photoUrls = photos && photos.length > 0 ? photos : (photo ? [photo] : []);
    const primaryPhoto = photoUrls.length > 0 ? photoUrls[0] : 'https://placehold.co/300x200/2d5a3c/ffffff/png?text=Waste+Photo';

    const newReport = new Report({
      description: description,
      location: location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      wasteType: wasteType || 'general',
      photo: primaryPhoto, // Main photo for single photo field
      photos: photoUrls,   // NEW: Array of all photos
      submittedBy: new mongoose.Types.ObjectId(userId),
      status: 'submitted',
      priority: 'pending'
    });
    
    const savedReport = await newReport.save();
    
    console.log('✅ Report saved successfully with', photoUrls.length, 'photos!');
    
    res.json({
      success: true,
      message: 'Report submitted successfully!',
      report: savedReport
    });
    
  } catch (error) {
    console.log('❌ SUBMISSION ERROR:', error);
    
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

// Update report priority - FOR REPORT ASSESSMENT
router.put('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { priority, status } = req.body;

    console.log('🔄 Updating report:', reportId);
    console.log('📊 Update data:', { priority, status });

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true } // Return updated document
    );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    console.log('✅ Report updated successfully:', updatedReport._id);
    console.log('📊 New priority:', updatedReport.priority);
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });
    
  } catch (error) {
    console.log('❌ UPDATE ERROR:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
});

module.exports = router;