const express = require('express');
const Collector = require('../models/Collector');
const router = express.Router();

// 🗺️ Fixed Starting Points for Nairobi
const NAIROBI_DEPOTS = {
  CENTRAL: {
    name: "Central Depot - City Centre",
    coordinates: [-1.2921, 36.8219],
    zone: "Central Nairobi"
  },
  EASTERN: {
    name: "Eastern Depot - Dandora",
    coordinates: [-1.2833, 36.8667], 
    zone: "Eastern Nairobi"
  },
  WESTERN: {
    name: "Western Depot - Westlands",
    coordinates: [-1.2584, 36.7925],
    zone: "Western Nairobi"
  }
};

// 🧮 Utility function to calculate distance between coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

// 🧭 Find nearest depot to waste cluster
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
  
  return {
    ...nearestDepot,
    distanceToCluster: shortestDistance
  };
}

// 🚗 Calculate optimized route with traffic considerations
function calculateOptimizedRoute(clusterCoordinates, depot) {
  const baseTimePerKm = 4; // minutes per km in Nairobi traffic
  const collectionTime = 30; // fixed time for waste collection
  
  const travelDistance = depot.distanceToCluster * 2; // round trip
  const travelTime = travelDistance * baseTimePerKm;
  const totalTime = travelTime + collectionTime;
  
  return {
    startPoint: depot.coordinates,
    collectionPoint: clusterCoordinates,
    endPoint: depot.coordinates, // return to depot
    totalDistance: Math.round(travelDistance * 10) / 10, // 1 decimal place
    estimatedTime: Math.round(totalTime),
    travelTime: Math.round(travelTime),
    collectionTime: collectionTime
  };
}

// 📍 Validate and normalize GPS coordinates
function validateCoordinates(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Invalid coordinates format');
  }
  
  const [lat, lng] = coordinates.map(coord => parseFloat(coord));
  
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Coordinates must be valid numbers');
  }
  
  // Validate Nairobi area coordinates
  if (lat < -1.5 || lat > -1.1 || lng < 36.6 || lng > 37.0) {
    console.warn('⚠️ Coordinates outside typical Nairobi area:', { lat, lng });
  }
  
  return [lat, lng];
}

// Existing routes remain the same until we modify the assign-route endpoint
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
      
      // Update performance metrics
      collector.performance.routesCompleted += 1;
      collector.performance.reportsCompleted += (route.reportCount || 0);
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

// 🚀 ENHANCED: Route assignment with optimization
router.post('/:id/assign-route', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // Validate and normalize GPS coordinates
    let validatedCoordinates;
    try {
      validatedCoordinates = validateCoordinates(req.body.gpsCoordinates);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check for duplicate routes
    const existingRoute = collector.assignedRoutes.find(
      route => 
        route.routeId === req.body.routeId ||
        (route.clusterId === req.body.clusterId && 
         route.scheduledDate === req.body.scheduledDate &&
         route.status === 'scheduled')
    );

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'This route is already assigned to this collector',
        existingRoute: existingRoute
      });
    }

    // 🗺️ ROUTE OPTIMIZATION: Find nearest depot and calculate optimal route
    const nearestDepot = findNearestDepot(validatedCoordinates);
    const optimizedRoute = calculateOptimizedRoute(validatedCoordinates, nearestDepot);

    console.log("🚀 Route Optimization Results:", {
      cluster: req.body.clusterName,
      coordinates: validatedCoordinates,
      nearestDepot: nearestDepot.name,
      totalDistance: `${optimizedRoute.totalDistance} km`,
      estimatedTime: `${optimizedRoute.estimatedTime} min`
    });

    const routeData = {
      routeId: req.body.routeId,
      clusterId: req.body.clusterId,
      clusterName: req.body.clusterName,
      clusterLocation: req.body.clusterLocation,
      gpsCoordinates: validatedCoordinates, // Use validated coordinates
      assignedDate: req.body.assignedDate,
      scheduledDate: req.body.scheduledDate,
      status: req.body.status || 'scheduled',
      reportCount: req.body.reportCount,
      notes: req.body.notes,
      
      // 🆕 OPTIMIZED ROUTE DATA
      pickupLocation: nearestDepot.name,
      pickupCoordinates: nearestDepot.coordinates,
      destinationCoordinates: validatedCoordinates,
      optimizedRoute: optimizedRoute,
      
      // 🆕 CALCULATED METRICS
      estimatedTime: `${optimizedRoute.estimatedTime} minutes`,
      distance: `${optimizedRoute.totalDistance} km`,
      travelTime: `${optimizedRoute.travelTime} minutes`,
      collectionTime: `${optimizedRoute.collectionTime} minutes`
    };

    console.log("📦 Saving optimized route data:", {
      routeId: routeData.routeId,
      cluster: routeData.clusterName,
      pickup: routeData.pickupLocation,
      coordinates: routeData.gpsCoordinates,
      distance: routeData.distance,
      time: routeData.estimatedTime
    });

    collector.assignedRoutes.push(routeData);
    await collector.save();

    res.json({
      success: true,
      message: 'Optimized route assigned to collector successfully',
      route: routeData,
      optimization: {
        depot: nearestDepot.name,
        totalDistance: optimizedRoute.totalDistance,
        estimatedTime: optimizedRoute.estimatedTime
      }
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

// 🆕 NEW: Get optimized navigation URL
router.get('/:collectorId/routes/:routeId/navigation', async (req, res) => {
  try {
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

    // Generate navigation URLs for different platforms
    const [lat, lng] = route.gpsCoordinates;
    
    const navigationData = {
      android: `google.navigation:q=${lat},${lng}`,
      ios: `maps://app?daddr=${lat},${lng}&dirflg=d`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      coordinates: { lat, lng },
      pickupLocation: route.pickupLocation,
      destination: route.clusterLocation
    };

    res.json({
      success: true,
      navigation: navigationData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating navigation',
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