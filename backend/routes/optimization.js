const express = require('express');
const Report = require('../models/Report');
const router = express.Router();

// NEW: Route optimization algorithm
router.get('/optimized-routes', async (req, res) => {
  try {
    console.log('🔄 Calculating optimized routes...');
    
    // Get all reports with valid locations
    const reports = await Report.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      status: { $in: ['submitted', 'pending'] }
    });

    if (reports.length === 0) {
      return res.json({
        success: true,
        message: 'No reports available for route optimization',
        optimizedRoutes: []
      });
    }

    // Use your existing clustering logic
    const clusters = createClusters(reports);
    
    // NEW: Generate optimized routes from clusters
    const optimizedRoutes = generateOptimizedRoutes(clusters);
    
    console.log(`✅ Generated ${optimizedRoutes.length} optimized routes from ${clusters.length} clusters`);
    
    res.json({
      success: true,
      message: 'Routes optimized successfully',
      clusters: clusters.length,
      routes: optimizedRoutes.length,
      optimizedRoutes: optimizedRoutes
    });
    
  } catch (error) {
    console.log('❌ ROUTE OPTIMIZATION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing routes',
      error: error.message
    });
  }
});

// Reuse your clustering logic (from MapView.jsx)
const createClusters = (reports, maxDistanceMeters = 100) => {
  if (!reports || reports.length === 0) return [];

  const clusters = [];
  const visited = new Set();
  
  reports.forEach((report, index) => {
    if (visited.has(index)) return;

    const cluster = {
      id: `cluster-${clusters.length + 1}`,
      reports: [report],
      center: [report.latitude, report.longitude]
    };

    visited.add(index);

    const findNeighbors = (currentReport, currentIndex) => {
      reports.forEach((otherReport, otherIndex) => {
        if (!visited.has(otherIndex) && currentIndex !== otherIndex) {
          const distance = calculateDistance(
            currentReport.latitude, currentReport.longitude,
            otherReport.latitude, otherReport.longitude
          );

          if (distance <= maxDistanceMeters) {
            cluster.reports.push(otherReport);
            visited.add(otherIndex);
            
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + r.latitude, 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + r.longitude, 0) / cluster.reports.length
            ];

            findNeighbors(otherReport, otherIndex);
          }
        }
      });
    };

    findNeighbors(report, index);
    
    const priorityInfo = getPriorityFromClusterSize(cluster.reports.length);
    cluster.priority = priorityInfo.name;
    cluster.color = priorityInfo.color;
    
    clusters.push(cluster);
  });

  return clusters;
};

// NEW: Route optimization algorithm
const generateOptimizedRoutes = (clusters) => {
  if (clusters.length === 0) return [];

  // Sort clusters by priority (Critical -> High -> Medium -> Low)
  const priorityOrder = {
    "Critical Priority Zone": 4,
    "High Priority Zone": 3, 
    "Medium Priority Area": 2,
    "Low Priority Zone": 1
  };

  const sortedClusters = [...clusters].sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );

  // Generate routes (max 5 clusters per route for efficiency)
  const routes = [];
  const clustersPerRoute = 5;
  
  for (let i = 0; i < sortedClusters.length; i += clustersPerRoute) {
    const routeClusters = sortedClusters.slice(i, i + clustersPerRoute);
    
    // Calculate optimal path using nearest neighbor algorithm
    const optimalPath = calculateOptimalPath(routeClusters);
    
    routes.push({
      id: `route-${routes.length + 1}`,
      name: `Collection Route ${routes.length + 1}`,
      clusters: optimalPath,
      totalStops: optimalPath.length,
      estimatedTime: calculateEstimatedTime(optimalPath),
      distance: calculateRouteDistance(optimalPath),
      priority: routeClusters[0]?.priority || 'Medium'
    });
  }

  return routes;
};

// NEW: Optimal path calculation (Traveling Salesman Problem - simplified)
const calculateOptimalPath = (clusters) => {
  if (clusters.length <= 1) return clusters;

  const path = [clusters[0]]; // Start with first cluster
  const unvisited = new Set(clusters.slice(1));
  
  while (unvisited.size > 0) {
    const lastCluster = path[path.length - 1];
    let nearestCluster = null;
    let minDistance = Infinity;

    // Find nearest unvisited cluster
    unvisited.forEach(cluster => {
      const distance = calculateDistance(
        lastCluster.center[0], lastCluster.center[1],
        cluster.center[0], cluster.center[1]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCluster = cluster;
      }
    });

    if (nearestCluster) {
      path.push(nearestCluster);
      unvisited.delete(nearestCluster);
    }
  }

  return path;
};

// NEW: Helper functions
const calculateRouteDistance = (clusters) => {
  let totalDistance = 0;
  for (let i = 0; i < clusters.length - 1; i++) {
    totalDistance += calculateDistance(
      clusters[i].center[0], clusters[i].center[1],
      clusters[i + 1].center[0], clusters[i + 1].center[1]
    );
  }
  return (totalDistance / 1000).toFixed(2); // Convert to kilometers
};

const calculateEstimatedTime = (clusters) => {
  const baseTimePerStop = 15; // minutes per stop
  const travelSpeed = 30; // km/h
  const distance = parseFloat(calculateRouteDistance(clusters));
  
  const travelTime = (distance / travelSpeed) * 60; // minutes
  const serviceTime = clusters.length * baseTimePerStop;
  
  return Math.round(travelTime + serviceTime);
};

// Reuse your existing helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getPriorityFromClusterSize = (clusterSize) => {
  if (clusterSize >= 20) return { name: "Critical Priority Zone", color: "#8B0000" };
  if (clusterSize >= 5) return { name: "High Priority Zone", color: "#FF0000" };
  if (clusterSize >= 3) return { name: "Medium Priority Area", color: "#FFA500" };
  return { name: "Low Priority Zone", color: "#008000" };
};

module.exports = router;