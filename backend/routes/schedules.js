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

    if (schedule.clusterId) {
      try {
        // Get all reports that belong to this cluster
        // Since clusters are created from reports with similar coordinates, we need to find reports
        // that match the cluster's characteristics. We'll use the cluster name as a reference.
        const clusterReports = await Report.find({
          $or: [
            { location: { $regex: schedule.clusterName, $options: 'i' } },
            { description: { $regex: schedule.clusterName, $options: 'i' } }
          ],
          status: { $in: ['submitted', 'in-progress'] } 
        });

        console.log(`🔄 STATUS SYNC: Found ${clusterReports.length} reports to update for cluster ${schedule.clusterName}`);

        if (clusterReports.length > 0) {
          const reportIds = clusterReports.map(report => report._id);
          
          const updateResult = await Report.updateMany(
            { _id: { $in: reportIds } },
            { 
              $set: { 
                status: 'completed',
                priority: 'completed' 
              } 
            }
          );

          console.log(`✅ STATUS SYNC: Updated ${updateResult.modifiedCount} reports to 'completed' status`);
        }
      } catch (reportError) {
        console.error('❌ STATUS SYNC ERROR: Failed to update reports:', reportError.message);
      }
    }

    if (schedule.routeId) {
      const collector = await Collector.findById(schedule.collectorId);
      if (collector) {
        const route = collector.assignedRoutes.find(r => r.routeId === schedule.routeId);
        if (route) {
          route.status = 'completed';
          route.completedAt = new Date();
          
          collector.performance.routesCompleted += 1;
          collector.performance.reportsCompleted += (schedule.reportCount || 0);
          
          await collector.save();
        }
      }
    }

    schedule.status = 'completed';
    schedule.completedAt = new Date();
    const updatedSchedule = await schedule.save();

    res.json({ 
      success: true, 
      message: 'Schedule completed, collector route updated, and all related reports marked as completed', 
      schedule: updatedSchedule 
    });
    
  } catch (error) {
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