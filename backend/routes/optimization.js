const express = require('express');
const Report = require('../models/Report');
const router = express.Router();

router.post('/optimize-routes', async (req, res) => {
  try {
    const { clusterIds, depotLocation } = req.body;
    
    const allReports = await Report.find({
      'location.address': { $exists: true, $ne: '' }
    }).limit(50);

    const clusters = createSmartClusters(allReports);
    const selectedClusters = clusters.filter(cluster => 
      clusterIds.includes(cluster.id)
    );

    if (selectedClusters.length === 0) {
      return res.json({
        success: true,
        optimizedRoutes: []
      });
    }

    const optimizedRoutes = generateOptimizedRoutes(selectedClusters, depotLocation);
    
    res.json({
      success: true,
      originalClusters: selectedClusters.length,
      optimizedRoutes: optimizedRoutes,
      efficiency: calculateEfficiency(selectedClusters, optimizedRoutes)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error optimizing routes',
      error: error.message
    });
  }
});

const generateOptimizedRoutes = (clusters, depot = [-1.286389, 36.817223]) => {
  if (clusters.length === 0) return [];

  const sortedClusters = [...clusters].sort((a, b) => {
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
  });

  const routes = [];
  const maxClustersPerRoute = 3;

  for (let i = 0; i < sortedClusters.length; i += maxClustersPerRoute) {
    const routeClusters = sortedClusters.slice(i, i + maxClustersPerRoute);
    const optimalPath = calculateOptimalPath([depot, ...routeClusters, depot]);
    
    routes.push({
      id: `route-${routes.length + 1}`,
      name: `Optimized Route ${routes.length + 1}`,
      clusters: optimalPath.slice(1, -1),
      path: optimalPath,
      totalStops: routeClusters.length,
      estimatedTime: Math.round(routeClusters.length * 25 + calculateRouteDistance(optimalPath) / 1000 * 20),
      distance: (calculateRouteDistance(optimalPath) / 1000).toFixed(2),
      priority: routeClusters[0]?.priority || 'medium'
    });
  }

  return routes;
};

const calculateOptimalPath = (points) => {
  if (points.length <= 3) return points;

  const path = [points[0]];
  const unvisited = new Set(points.slice(1, -1));
  const endPoint = points[points.length - 1];

  while (unvisited.size > 0) {
    const lastPoint = path[path.length - 1];
    let nearestPoint = null;
    let minDistance = Infinity;

    unvisited.forEach(point => {
      const distance = calculateDistance(
        lastPoint.center ? lastPoint.center[0] : lastPoint[0],
        lastPoint.center ? lastPoint.center[1] : lastPoint[1],
        point.center ? point.center[0] : point[0],
        point.center ? point.center[1] : point[1]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    if (nearestPoint) {
      path.push(nearestPoint);
      unvisited.delete(nearestPoint);
    }
  }

  path.push(endPoint);
  return path;
};

const calculateRouteDistance = (path) => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const pointA = path[i];
    const pointB = path[i + 1];
    totalDistance += calculateDistance(
      pointA.center ? pointA.center[0] : pointA[0],
      pointA.center ? pointA.center[1] : pointA[1],
      pointB.center ? pointB.center[0] : pointB[0],
      pointB.center ? pointB.center[1] : pointB[1]
    );
  }
  return totalDistance;
};

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

const calculateEfficiency = (originalClusters, optimizedRoutes) => {
  const originalDistance = originalClusters.length * 2000;
  const optimizedDistance = optimizedRoutes.reduce((sum, route) => 
    sum + parseFloat(route.distance) * 1000, 0
  );
  
  const improvement = ((originalDistance - optimizedDistance) / originalDistance * 100).toFixed(1);
  return {
    improvement: improvement + '%',
    distanceSaved: ((originalDistance - optimizedDistance) / 1000).toFixed(1) + 'km',
    timeSaved: '~' + Math.round((originalDistance - optimizedDistance) / 1000 * 3) + ' minutes'
  };
};

const createSmartClusters = (reports) => {
  const reportsWithLocation = reports.filter(report => 
    (report.latitude && report.longitude) || 
    (report.location?.latitude && report.location?.longitude)
  );

  const clusters = [];
  const usedReports = new Set();
  const maxDistance = 0.001;

  reportsWithLocation.forEach((report, index) => {
    if (usedReports.has(index)) return;

    const lat1 = report.latitude || report.location?.latitude;
    const lon1 = report.longitude || report.location?.longitude;
    
    const cluster = {
      id: `cluster-${clusters.length + 1}`,
      name: `Zone ${clusters.length + 1}`,
      reports: [report],
      center: [lat1, lon1],
      reportCount: 1,
      priority: 'medium'
    };

    usedReports.add(index);

    reportsWithLocation.forEach((otherReport, otherIndex) => {
      if (!usedReports.has(otherIndex) && index !== otherIndex) {
        const lat2 = otherReport.latitude || otherReport.location?.latitude;
        const lon2 = otherReport.longitude || otherReport.location?.longitude;
        
        const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
        
        if (distance <= maxDistance) {
          cluster.reports.push(otherReport);
          usedReports.add(otherIndex);
          
          cluster.center = [
            cluster.reports.reduce((sum, r) => sum + (r.latitude || r.location?.latitude), 0) / cluster.reports.length,
            cluster.reports.reduce((sum, r) => sum + (r.longitude || r.location?.longitude), 0) / cluster.reports.length
          ];
        }
      }
    });

    cluster.reportCount = cluster.reports.length;
    
    if (cluster.reportCount >= 5) cluster.priority = 'critical';
    else if (cluster.reportCount >= 3) cluster.priority = 'high';
    else if (cluster.reportCount >= 2) cluster.priority = 'medium';
    else cluster.priority = 'low';

    const firstReport = cluster.reports[0];
    const address = firstReport.address || firstReport.location?.address;
    if (address && address !== 'Nairobi') {
      const areaName = address.split(',')[0]?.trim();
      if (areaName && areaName !== 'Nairobi') {
        cluster.name = `${areaName} Area`;
      }
    }

    clusters.push(cluster);
  });

  return clusters;
};

module.exports = router;