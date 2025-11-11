const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collector = require('../models/Collector');
const router = express.Router();

const JWT_SECRET = 'smartwaste_nairobi_secret_key_2024';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'resident' } = req.body;

    // Validate role
    if (!['resident', 'collector', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Optional: Verify user type if specified
    if (userType && user.role !== userType) {
      return res.status(400).json({
        success: false,
        message: `Account is not a ${userType} account`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Collector-specific login for mobile app
router.post('/collector-login', async (req, res) => {
  try {
    const { email } = req.body;

    // Find collector by email (no password for simplicity)
    const collector = await Collector.findOne({ email });
    
    if (!collector) {
      return res.status(401).json({
        success: false,
        message: 'Collector not found'
      });
    }

    if (!collector.activeAccount) {
      return res.status(401).json({
        success: false,
        message: 'Collector account is deactivated'
      });
    }

    // Create token for collector
    const token = jwt.sign(
      { 
        collectorId: collector._id, 
        email: collector.email, 
        role: 'collector',
        name: collector.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return collector data including ID for mobile app
    res.json({
      success: true,
      message: 'Collector login successful',
      token,
      collector: {
        _id: collector._id,
        name: collector.name,
        email: collector.email,
        phone: collector.phone,
        zone: collector.zone,
        performance: collector.performance
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Collector login failed',
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  const dbStatus = require('mongoose').connection.readyState;
  const statusText = dbStatus === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'ok', 
    database: statusText,
    timestamp: new Date().toISOString(),
    service: 'SmartWaste Nairobi Auth API'
  });
});

module.exports = router;