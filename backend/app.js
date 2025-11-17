const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const feedbackRoutes = require('./routes/feedback');

app.use(cors());
app.use(express.json());
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/collectors', require('./routes/collectors'));
app.use('/api/users', require('./routes/users'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/feedback', feedbackRoutes);
app.use('/api/optimization', require('./routes/optimization'));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🌍 SmartWaste Nairobi Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const Report = require('./models/Report');
    const count = await Report.countDocuments();
    res.json({ 
      success: true, 
      message: 'Database connected!',
      reportCount: count 
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

module.exports = app; 