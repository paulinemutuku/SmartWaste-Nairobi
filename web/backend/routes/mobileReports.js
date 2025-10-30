const express = require('express');
const router = express.Router();

router.get('/reports', async (req, res) => {
  try {
    const response = await fetch('https://smart-waste-nairobi-chi.vercel.app/api/reports/all');
    const result = await response.json();
    
    res.json({
      success: true,
      count: result.reports.length,
      reports: result.reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mobile reports',
      error: error.message
    });
  }
});

module.exports = router;