const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schedules', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { clusterId, clusterName, collectorId, collectorName, date, reportCount } = req.body;
    
    const newSchedule = new Schedule({
      clusterId,
      clusterName, 
      collectorId,
      collectorName,
      date,
      reportCount,
      status: 'scheduled'
    });

    const savedSchedule = await newSchedule.save();
    res.json({ success: true, message: 'Schedule created', schedule: savedSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating schedule', error: error.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    res.json({ success: true, message: 'Schedule completed', schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing schedule', error: error.message });
  }
});

module.exports = router;