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

router.get('/:id/routes', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    res.json({
      success: true,
      routes: collector.assignedRoutes || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching collector routes',
      error: error.message
    });
  }
});

router.put('/:collectorId/routes/:routeId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const collector = await Collector.findById(req.params.collectorId);
    
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    const route = collector.assignedRoutes.id(req.params.routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    route.status = status;
    if (status === 'completed') {
      route.completedAt = new Date();
    }

    await collector.save();

    res.json({
      success: true,
      message: 'Route status updated successfully',
      route: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route status',
      error: error.message
    });
  }
});

router.get('/:id/performance', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    res.json({
      success: true,
      performance: collector.performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching collector performance',
      error: error.message
    });
  }
});

router.post('/:id/assign-route', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // More flexible duplicate check - only prevent exact duplicates
    const existingRoute = collector.assignedRoutes.find(
      route => 
        route.routeId === req.body.routeId || // Same route ID
        (route.clusterId === req.body.clusterId && 
         route.scheduledDate === req.body.scheduledDate &&
         route.status === 'scheduled') // Same cluster, same date, still scheduled
    );

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'This route is already assigned to this collector',
        existingRoute: existingRoute
      });
    }

    const routeData = {
      routeId: req.body.routeId,
      clusterId: req.body.clusterId,
      clusterName: req.body.clusterName,
      clusterLocation: req.body.clusterLocation,
      gpsCoordinates: req.body.gpsCoordinates,
      assignedDate: req.body.assignedDate,
      scheduledDate: req.body.scheduledDate,
      status: req.body.status || 'scheduled',
      reportCount: req.body.reportCount,
      notes: req.body.notes,
      pickupLocation: req.body.pickupLocation,
      destinationCoordinates: req.body.destinationCoordinates,
      estimatedTime: req.body.estimatedTime,
      distance: req.body.distance
    };

    console.log("📦 Saving route data:", {
      routeId: routeData.routeId,
      clusterId: routeData.clusterId,
      coordinates: routeData.gpsCoordinates,
      date: routeData.scheduledDate
    });

    collector.assignedRoutes.push(routeData);
    await collector.save();

    res.json({
      success: true,
      message: 'Route assigned to collector successfully',
      route: routeData
    });
  } catch (error) {
    console.error("❌ Error in assign-route:", error);
    res.status(500).json({
      success: false,
      message: 'Error assigning route to collector',
      error: error.message
    });
  }
});

router.delete('/:collectorId/routes/:routeId', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.collectorId);
    
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // Find and remove the route
    const routeIndex = collector.assignedRoutes.findIndex(
      route => route._id.toString() === req.params.routeId
    );

    if (routeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    collector.assignedRoutes.splice(routeIndex, 1);
    await collector.save();

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
});

module.exports = router;