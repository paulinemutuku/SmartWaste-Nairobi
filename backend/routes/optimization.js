const express = require('express');
const Report = require('../models/Report');
const router = express.Router();

router.post('/optimize-routes', async (req, res) => {
  try {
    const { clusterIds, depotLocation } = req.body;
    
    console.log('Received cluster IDs:', clusterIds);
    
    const allReports = await Report.find().limit(20);

    const clusters = createDemoClusters();
    const selectedClusters = clusters.filter(cluster => 
      clusterIds.includes(cluster.id)
    );

    console.log('Found clusters:', selectedClusters.length);

    if (selectedClusters.length === 0) {
      return res.json({
        success: true,
        optimizedRoutes: createDemoRoutes()
      });
    }

    const optimizedRoutes = generateOptimizedRoutes(selectedClusters, depotLocation);
    
    res.json({
      success: true,
      originalClusters: selectedClusters.length,
      optimizedRoutes: optimizedRoutes
    });

  } catch (error) {
    console.log('Optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing routes',
      error: error.message
    });
  }
});

const generateOptimizedRoutes = (clusters, depot = [-1.286389, 36.817223]) => {
  if (clusters.length === 0) return createDemoRoutes();

  const routes = [];
  
  if (clusters.length <= 3) {
    routes.push({
      id: `route-1`,
      name: `Optimized Route 1`,
      clusters: clusters,
      totalStops: clusters.length,
      estimatedTime: clusters.length * 25,
      distance: (clusters.length * 1.5).toFixed(1),
      priority: clusters[0]?.priority || 'medium'
    });
  } else {
    const route1Clusters = clusters.slice(0, Math.ceil(clusters.length / 2));
    const route2Clusters = clusters.slice(Math.ceil(clusters.length / 2));
    
    routes.push({
      id: `route-1`,
      name: `East Route`,
      clusters: route1Clusters,
      totalStops: route1Clusters.length,
      estimatedTime: route1Clusters.length * 25,
      distance: (route1Clusters.length * 1.5).toFixed(1),
      priority: 'high'
    });
    
    routes.push({
      id: `route-2`,
      name: `West Route`,
      clusters: route2Clusters,
      totalStops: route2Clusters.length,
      estimatedTime: route2Clusters.length * 25,
      distance: (route2Clusters.length * 1.5).toFixed(1),
      priority: 'medium'
    });
  }

  return routes;
};

const createDemoClusters = () => {
  return [
    {
      id: "CLUSTER-1",
      name: "Dandora Area",
      center: [-1.2600, 36.8900],
      reportCount: 5,
      priority: "high"
    },
    {
      id: "CLUSTER-2", 
      name: "Kayole Area",
      center: [-1.2750, 36.9100],
      reportCount: 3,
      priority: "medium"
    },
    {
      id: "CLUSTER-3",
      name: "Embakasi Area", 
      center: [-1.3000, 36.9000],
      reportCount: 4,
      priority: "high"
    },
    {
      id: "CLUSTER-4",
      name: "Kariobangi Area",
      center: [-1.2700, 36.8800],
      reportCount: 2,
      priority: "low"
    }
  ];
};

const createDemoRoutes = () => {
  return [
    {
      id: "route-1",
      name: "East Nairobi Route",
      clusters: [
        { id: "CLUSTER-1", name: "Dandora Area", reportCount: 5 },
        { id: "CLUSTER-4", name: "Kariobangi Area", reportCount: 2 }
      ],
      totalStops: 2,
      estimatedTime: 65,
      distance: "3.2",
      priority: "high"
    },
    {
      id: "route-2", 
      name: "South Nairobi Route",
      clusters: [
        { id: "CLUSTER-2", name: "Kayole Area", reportCount: 3 },
        { id: "CLUSTER-3", name: "Embakasi Area", reportCount: 4 }
      ],
      totalStops: 2,
      estimatedTime: 55,
      distance: "2.8",
      priority: "medium"
    }
  ];
};

module.exports = router;