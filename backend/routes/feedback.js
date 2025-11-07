const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/submit', async (req, res) => {
  try {
    const { rating, message, submittedBy } = req.body;
    
    console.log('FEEDBACK SUBMISSION:', { rating, message, submittedBy });

    if (!rating || !message || !submittedBy) {
      return res.status(400).json({
        success: false,
        message: 'Rating, message, and user ID are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const newFeedback = new Feedback({
      rating,
      message: message.trim(),
      submittedBy: new mongoose.Types.ObjectId(submittedBy)
    });

    const savedFeedback = await newFeedback.save();
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: savedFeedback
    });
  } catch (error) {
    console.log('FEEDBACK SUBMISSION ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: feedback.length,
      feedback: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
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

    const feedback = await Feedback.find({ 
      submittedBy: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: feedback.length,
      feedback: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user feedback',
      error: error.message
    });
  }
});

module.exports = router;