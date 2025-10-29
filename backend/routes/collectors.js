const express = require('express');
const Collector = require('../models/Collector');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const collectors = await Collector.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      collectors: collectors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching collectors',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, zone } = req.body;
    
    const newCollector = new Collector({
      name,
      email,
      phone,
      zone
    });

    const savedCollector = await newCollector.save();
    res.json({
      success: true,
      message: 'Collector created successfully!',
      collector: savedCollector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating collector',
      error: error.message
    });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { activeAccount } = req.body;
    const collector = await Collector.findByIdAndUpdate(
      req.params.id,
      { activeAccount },
      { new: true }
    );
    res.json({
      success: true,
      message: 'Collector status updated!',
      collector: collector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating collector',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Collector.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Collector deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting collector',
      error: error.message
    });
  }
});

module.exports = router;