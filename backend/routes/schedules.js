const express = require('express');
const Schedule = require('../models/Schedule');
const Collector = require('../models/Collector');
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
    
    // 🚀 NEW: Actually assign route to collector
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ 
        success: false, 
        message: 'Collector not found' 
      });
    }

    // Create route assignment
    const routeAssignment = {
      routeId: `route-${Date.now()}`,
      clusterId: clusterId,
      clusterName: clusterName,
      assignedDate: new Date(),
      scheduledDate: new Date(date),
      status: 'scheduled',
      reportCount: reportCount
    };

    // Add to collector's assigned routes
    collector.assignedRoutes.push(routeAssignment);
    
    // Add to assigned clusters if not already there
    if (!collector.assignedClusters.includes(clusterId)) {
      collector.assignedClusters.push(clusterId);
    }

    await collector.save();

    // Create schedule record (existing functionality)
    const newSchedule = new Schedule({
      clusterId,
      clusterName, 
      collectorId,
      collectorName,
      date,
      reportCount,
      status: 'scheduled',
      routeId: routeAssignment.routeId // 🆕 Link to route
    });

    const savedSchedule = await newSchedule.save();
    
    res.json({ 
      success: true, 
      message: 'Schedule created and route assigned to collector', 
      schedule: savedSchedule,
      routeAssigned: routeAssignment
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating schedule', error: error.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    // 🚀 NEW: Also update collector's route status
    if (schedule.routeId) {
      const collector = await Collector.findById(schedule.collectorId);
      if (collector) {
        const route = collector.assignedRoutes.find(r => r.routeId === schedule.routeId);
        if (route) {
          route.status = 'completed';
          route.completedAt = new Date();
          
          // Update performance metrics
          collector.performance.routesCompleted += 1;
          collector.performance.reportsCompleted += (schedule.reportCount || 0);
          
          await collector.save();
        }
      }
    }

    // Update schedule status (existing functionality)
    schedule.status = 'completed';
    const updatedSchedule = await schedule.save();

    res.json({ 
      success: true, 
      message: 'Schedule completed and collector route updated', 
      schedule: updatedSchedule 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing schedule', error: error.message });
  }
});

// 🆕 NEW: Get collector's scheduled routes
router.get('/collector/:collectorId', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.collectorId);
    
    if (!collector) {
      return res.status(404).json({ success: false, message: 'Collector not found' });
    }

    const activeRoutes = collector.assignedRoutes.filter(route => 
      route.status === 'scheduled' || route.status === 'in-progress'
    );

    res.json({
      success: true,
      collector: {
        id: collector._id,
        name: collector.name,
        zone: collector.zone
      },
      assignedRoutes: activeRoutes,
      totalRoutes: activeRoutes.length
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching collector routes', error: error.message });
  }
});

module.exports = router;