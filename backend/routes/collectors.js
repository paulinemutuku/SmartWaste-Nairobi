const express = require('express');
const Collector = require('../models/Collector');
const router = express.Router();

const NAIROBI_DEPOTS = {
  CENTRAL: { name: "Central Depot", coordinates: [-1.2921, 36.8219], zone: "Central" },
  EASTERN: { name: "Eastern Depot", coordinates: [-1.2833, 36.8667], zone: "Eastern" },
  WESTERN: { name: "Western Depot", coordinates: [-1.2584, 36.7925], zone: "Western" }
};

function calculateDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearestDepot(clusterCoordinates) {
  let nearestDepot = null;
  let shortestDistance = Infinity;
  for (const [key, depot] of Object.entries(NAIROBI_DEPOTS)) {
    const distance = calculateDistance(clusterCoordinates, depot.coordinates);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestDepot = { ...depot, key };
    }
  }
  return { ...nearestDepot, distanceToCluster: shortestDistance };
}

function calculateOptimizedRoute(clusterCoordinates, depot, urgency) {
  const baseTimePerKm = urgency === 'high' ? 3.5 : 4.2;
  const collectionTime = urgency === 'high' ? 20 : 35;
  const trafficFactor = getTrafficFactor();
  
  const travelDistance = depot.distanceToCluster * 2;
  const travelTime = travelDistance * baseTimePerKm * trafficFactor;
  const totalTime = travelTime + collectionTime;
  
  return {
    startPoint: depot.coordinates,
    collectionPoint: clusterCoordinates,
    endPoint: depot.coordinates,
    totalDistance: Math.round(travelDistance * 10) / 10,
    estimatedTime: Math.round(totalTime),
    travelTime: Math.round(travelTime),
    collectionTime: collectionTime,
    trafficLevel: getTrafficLevel(trafficFactor),
    fuelEfficiency: calculateFuelEfficiency(travelDistance),
    carbonFootprint: calculateCarbonFootprint(travelDistance)
  };
}

function getTrafficFactor() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 7 && hour <= 9) return 1.6;
  if (hour >= 16 && hour <= 19) return 1.8;
  if (hour >= 12 && hour <= 14) return 1.3;
  return 1.1;
}

function getTrafficLevel(factor) {
  if (factor >= 1.7) return 'Heavy';
  if (factor >= 1.4) return 'Moderate';
  return 'Light';
}

function calculateFuelEfficiency(distance) {
  const fuelPerKm = 0.12;
  return Math.round(distance * fuelPerKm * 100) / 100;
}

function calculateCarbonFootprint(distance) {
  const co2PerKm = 0.12;
  return Math.round(distance * co2PerKm);
}

function validateCoordinates(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Invalid coordinates format');
  }
  const [lat, lng] = coordinates.map(coord => parseFloat(coord));
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Coordinates must be valid numbers');
  }
  return [lat, lng];
}

router.get('/', async (req, res) => {
  try {
    const collectors = await Collector.find().sort({ createdAt: -1 });
    res.json({ success: true, collectors: collectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching collectors', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, zone } = req.body;
    const newCollector = new Collector({ name, email, phone, zone });
    const savedCollector = await newCollector.save();
    res.json({ success: true, message: 'Collector created successfully!', collector: savedCollector });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating collector', error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { activeAccount } = req.body;
    const collector = await Collector.findByIdAndUpdate(req.params.id, { activeAccount }, { new: true });
    res.json({ success: true, message: 'Collector status updated!', collector: collector });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating collector', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Collector.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Collector deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting collector', error: error.message });
  }
});

router.get('/:id/routes', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    res.json({ success: true, routes: collector.assignedRoutes || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching collector routes', error: error.message });
  }
});

router.put('/:collectorId/routes/:routeId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const collector = await Collector.findById(req.params.collectorId);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    const route = collector.assignedRoutes.id(req.params.routeId);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    route.status = status;
    if (status === 'completed') {
      route.completedAt = new Date();
      collector.performance.routesCompleted += 1;
      collector.performance.reportsCompleted += (route.reportCount || 0);
    }
    await collector.save();
    res.json({ success: true, message: 'Route status updated successfully', route: route });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating route status', error: error.message });
  }
});

router.get('/:id/performance', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    res.json({ success: true, performance: collector.performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching collector performance', error: error.message });
  }
});

router.post('/:id/assign-route', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    let validatedCoordinates;
    try { validatedCoordinates = validateCoordinates(req.body.gpsCoordinates); } 
    catch (error) { return res.status(400).json({ success: false, message: error.message }); }

    const existingRoute = collector.assignedRoutes.find(route => route.routeId === req.body.routeId || (route.clusterId === req.body.clusterId && route.scheduledDate === req.body.scheduledDate && route.status === 'scheduled'));
    if (existingRoute) return res.status(400).json({ success: false, message: 'This route is already assigned to this collector', existingRoute: existingRoute });

    const nearestDepot = findNearestDepot(validatedCoordinates);
    const urgency = (req.body.reportCount > 10 || req.body.urgentCount > 0) ? 'high' : 'normal';
    const optimizedRoute = calculateOptimizedRoute(validatedCoordinates, nearestDepot, urgency);

    const routeData = {
      routeId: req.body.routeId,
      clusterId: req.body.clusterId,
      clusterName: req.body.clusterName,
      clusterLocation: req.body.clusterLocation,
      gpsCoordinates: validatedCoordinates,
      assignedDate: req.body.assignedDate,
      scheduledDate: req.body.scheduledDate,
      status: req.body.status || 'scheduled',
      reportCount: req.body.reportCount,
      notes: req.body.notes,
      pickupLocation: nearestDepot.name,
      pickupCoordinates: nearestDepot.coordinates,
      destinationCoordinates: validatedCoordinates,
      optimizedRoute: optimizedRoute,
      estimatedTime: `${optimizedRoute.estimatedTime} minutes`,
      distance: `${optimizedRoute.totalDistance} km`,
      travelTime: `${optimizedRoute.travelTime} minutes`,
      collectionTime: `${optimizedRoute.collectionTime} minutes`,
      urgency: urgency,
      trafficLevel: optimizedRoute.trafficLevel,
      fuelEstimate: `${optimizedRoute.fuelEfficiency}L`,
      carbonFootprint: `${optimizedRoute.carbonFootprint}kg CO2`
    };

    collector.assignedRoutes.push(routeData);
    await collector.save();

    res.json({
      success: true,
      message: 'Ultimate optimized route assigned successfully',
      route: routeData,
      optimization: {
        depot: nearestDepot.name,
        totalDistance: optimizedRoute.totalDistance,
        estimatedTime: optimizedRoute.estimatedTime,
        traffic: optimizedRoute.trafficLevel,
        urgency: urgency,
        fuel: optimizedRoute.fuelEfficiency,
        carbon: optimizedRoute.carbonFootprint
      }
    });
  } catch (error) {
    console.error("Error in assign-route:", error);
    res.status(500).json({ success: false, message: 'Error assigning route to collector', error: error.message });
  }
});

router.get('/:collectorId/routes/:routeId/navigation', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.collectorId);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    const route = collector.assignedRoutes.id(req.params.routeId);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const [lat, lng] = route.gpsCoordinates;
    
    const navigationData = {
      android: `google.navigation:q=${lat},${lng}`,
      ios: `maps://app?daddr=${lat},${lng}&dirflg=d`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      coordinates: { lat, lng },
      optimizedRoute: {
        destination: route.clusterLocation,
        coordinates: { lat, lng },
        estimatedDistance: route.distance,
        estimatedTime: route.estimatedTime,
        optimizationType: 'ai_optimized',
        trafficAware: true,
        trafficLevel: route.trafficLevel,
        fuelEstimate: route.fuelEstimate,
        carbonFootprint: route.carbonFootprint,
        urgency: route.urgency,
        efficiencyScore: calculateEfficiencyScore(route)
      }
    };

    res.json({
      success: true,
      navigation: navigationData,
      routeInfo: {
        collectionPoint: route.clusterName,
        address: route.clusterLocation,
        reportCount: route.reportCount,
        urgency: route.urgency,
        priority: route.urgency === 'high' ? '🚨 HIGH PRIORITY' : '✅ Normal'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating navigation', error: error.message });
  }
});

function calculateEfficiencyScore(route) {
  const distance = parseFloat(route.distance) || 0;
  const reports = route.reportCount || 1;
  const efficiency = reports / (distance + 1);
  if (efficiency > 2) return 'A+';
  if (efficiency > 1.5) return 'A';
  if (efficiency > 1) return 'B';
  return 'C';
}

router.delete('/:collectorId/routes/:routeId', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.collectorId);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    const routeIndex = collector.assignedRoutes.findIndex(route => route._id.toString() === req.params.routeId);
    if (routeIndex === -1) return res.status(404).json({ success: false, message: 'Route not found' });
    collector.assignedRoutes.splice(routeIndex, 1);
    await collector.save();
    res.json({ success: true, message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting route', error: error.message });
  }
});

module.exports = router;