const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithReports = await Promise.all(users.map(async (user) => {
      const reportsCount = await Report.countDocuments({ submittedBy: user._id });
      await User.findByIdAndUpdate(user._id, { reportsCount: reportsCount });
      return {
        ...user.toObject(),
        reportsCount: reportsCount
      };
    }));

    res.json({
      success: true,
      users: usersWithReports,
      total: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastActive: { $gte: weekAgo } });
    
    const usersWithReportsData = await User.aggregate([
      {
        $lookup: {
          from: 'reports',
          localField: '_id',
          foreignField: 'submittedBy',
          as: 'reports'
        }
      },
      {
        $match: {
          'reports.0': { $exists: true }
        }
      },
      {
        $count: 'count'
      }
    ]);

    const usersWithReports = usersWithReportsData[0]?.count || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        usersWithReports
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

router.put('/:id/activity', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { lastActive: new Date() },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user activity',
      error: error.message
    });
  }
});

module.exports = router;