const express = require('express');
const Schedule = require('../models/Schedule');
const Collector = require('../models/Collector');
const Report = require('../models/Report');
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
    
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ 
        success: false, 
        message: 'Collector not found' 
      });
    }

    const routeAssignment = {
      routeId: `route-${Date.now()}`,
      clusterId: clusterId,
      clusterName: clusterName,
      assignedDate: new Date(),
      scheduledDate: new Date(date),
      status: 'scheduled',
      reportCount: reportCount
    };

    collector.assignedRoutes.push(routeAssignment);
    
    if (!collector.assignedClusters.includes(clusterId)) {
      collector.assignedClusters.push(clusterId);
    }

    await collector.save();

    const newSchedule = new Schedule({
      clusterId,
      clusterName, 
      collectorId,
      collectorName,
      date,
      reportCount,
      status: 'scheduled',
      routeId: routeAssignment.routeId 
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

    console.log(`🔄 COMPLETING SCHEDULE: ${schedule._id}`);
    console.log(`📊 Schedule details:`, {
      clusterId: schedule.clusterId,
      clusterName: schedule.clusterName,
      reportCount: schedule.reportCount,
      collectorId: schedule.collectorId
    });

    const allReportsBefore = await Report.find({});
    console.log(`📋 TOTAL REPORTS IN DB: ${allReportsBefore.length}`);
    
    const pendingBefore = allReportsBefore.filter(r => r.status === 'submitted' || r.status === 'in-progress');
    const completedBefore = allReportsBefore.filter(r => r.status === 'completed');
    console.log(`📋 BEFORE - Pending: ${pendingBefore.length}, Completed: ${completedBefore.length}`);

    const updateResult = await Report.updateMany(
      {
        status: { $in: ['submitted', 'in-progress'] }
      },
      {
        $set: {
          status: 'completed',
          priority: 'completed'
        }
      }
    );

    console.log(`✅ UPDATED ${updateResult.modifiedCount} REPORTS TO COMPLETED`);

    const allReportsAfter = await Report.find({});
    const pendingAfter = allReportsAfter.filter(r => r.status === 'submitted' || r.status === 'in-progress');
    const completedAfter = allReportsAfter.filter(r => r.status === 'completed');
    console.log(`📋 AFTER - Pending: ${pendingAfter.length}, Completed: ${completedAfter.length}`);

    if (schedule.routeId) {
      const collector = await Collector.findById(schedule.collectorId);
      if (collector) {
        const route = collector.assignedRoutes.find(r => r.routeId === schedule.routeId);
        if (route) {
          route.status = 'completed';
          route.completedAt = new Date();
          collector.performance.routesCompleted += 1;
          collector.performance.reportsCompleted += (updateResult.modifiedCount || schedule.reportCount || 0);
          await collector.save();
          console.log(`✅ UPDATED COLLECTOR ROUTE: ${collector.name}`);
        }
      }
    }

    schedule.status = 'completed';
    schedule.completedAt = new Date();
    const updatedSchedule = await schedule.save();

    console.log(`🎉 SCHEDULE COMPLETION SUCCESSFUL`);
    console.log(`📊 Final stats: ${updateResult.modifiedCount} reports marked completed`);

    res.json({ 
      success: true, 
      message: `Successfully completed schedule and updated ${updateResult.modifiedCount} reports`,
      schedule: updatedSchedule,
      reportsUpdated: updateResult.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ SCHEDULE COMPLETION ERROR:', error);
    res.status(500).json({ success: false, message: 'Error completing schedule', error: error.message });
  }
});

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