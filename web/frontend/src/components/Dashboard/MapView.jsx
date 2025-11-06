import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState([-0.4170, 36.9510]); // Nanyuki center
  const [dataSource, setDataSource] = useState(""); // To track where data is coming from

  // Nairobi-specific mock data - always available for demonstration
  const nairobiMockReports = [
    // Dandora Cluster
    { 
      _id: 'nairobi-dandora-1', 
      description: "Full bins near Dandora Market", 
      latitude: -1.2600, 
      longitude: 36.8900,
      address: "Dandora Market, Nairobi",
      createdAt: new Date(),
      isMock: true
    },
    { 
      _id: 'nairobi-dandora-2', 
      description: "Illegal dumping behind market", 
      latitude: -1.2601, 
      longitude: 36.8902,
      address: "Dandora Market Backside",
      createdAt: new Date(),
      isMock: true
    },
    // Kayole Cluster  
    { 
      _id: 'nairobi-kayole-1', 
      description: "Full bins in Kayole Estate", 
      latitude: -1.2750, 
      longitude: 36.9100,
      address: "Kayole Estate, Nairobi",
      createdAt: new Date(),
      isMock: true
    },
    { 
      _id: 'nairobi-kayole-2', 
      description: "Illegal dumping near shopping center", 
      latitude: -1.2751, 
      longitude: 36.9101,
      address: "Kayole Shopping Center",
      createdAt: new Date(),
      isMock: true
    }
  ];

  useEffect(() => {
    loadRealReports();
  }, []);

  const loadRealReports = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading reports from API...");
      
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      let allReports = [];
      let source = "";
      
      if (response.ok && result.success) {
        const reportsWithLocation = result.reports.filter(report => 
          report.latitude && report.longitude
        );
        
        console.log(`📊 API returned: ${result.reports?.length} total, ${reportsWithLocation.length} with location`);
        
        if (reportsWithLocation.length > 0) {
          allReports = reportsWithLocation;
          source = "API Real Data";
        } else {
          // If API returns reports but no location data, use Nairobi mock
          allReports = nairobiMockReports;
          source = "Nairobi Mock Data (No locations in API)";
        }
      } else {
        // If API fails, use Nairobi mock
        allReports = nairobiMockReports;
        source = "Nairobi Mock Data (API Failed)";
      }
      
      // If still no data, use Nairobi mock
      if (allReports.length === 0) {
        allReports = nairobiMockReports;
        source = "Nairobi Mock Data (No Data)";
      }
      
      setReports(allReports);
      setDataSource(source);
      
      // Create clusters
      const clustered = createClusters(allReports);
      setClusters(clustered);

      console.log("🎯 Final Result:", {
        dataSource: source,
        totalReports: allReports.length,
        clustersCreated: clustered.length,
        reports: allReports.map(r => ({
          id: r._id,
          lat: r.latitude,
          lng: r.longitude,
          isMock: r.isMock || false
        }))
      });

    } catch (error) {
      console.error("❌ Error loading reports:", error);
      // Use Nairobi mock data on error
      setReports(nairobiMockReports);
      setClusters(createClusters(nairobiMockReports));
      setDataSource("Nairobi Mock Data (Error)");
    } finally {
      setLoading(false);
    }
  };

  // Get automatic area name based on coordinates
  const getAreaNameFromCoordinates = (lat, lng) => {
    // Nairobi areas
    if (lat > -1.265 && lng > 36.885) return "Dandora Area";
    if (lat > -1.280 && lng > 36.905) return "Kayole Area"; 
    if (lat < -1.280) return "Industrial Area";
    if (lng < 36.800) return "Westlands";
    
    // Nanyuki areas (fallback)
    if (lat > -0.41 && lng > 36.94) return "Town Center";
    if (lat > -0.42 && lng > 36.95) return "Commercial District";
    
    return "Reported Location";
  };

  // IMPROVED clustering algorithm - DBSCAN-like approach
  const createClusters = (reports, maxDistanceMeters = 100) => {
    if (!reports || reports.length === 0) {
      return [];
    }

    const clusters = [];
    const visited = new Set();
    const clusterColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    reports.forEach((report, index) => {
      if (visited.has(index)) return;

      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        reports: [report],
        center: [report.latitude, report.longitude],
        color: clusterColors[clusters.length % clusterColors.length],
        areaName: getAreaNameFromCoordinates(report.latitude, report.longitude)
      };

      visited.add(index);

      // Find all nearby reports recursively
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
              
              // Update cluster center
              cluster.center = [
                cluster.reports.reduce((sum, r) => sum + r.latitude, 0) / cluster.reports.length,
                cluster.reports.reduce((sum, r) => sum + r.longitude, 0) / cluster.reports.length
              ];

              // Recursively find neighbors of this new report
              findNeighbors(otherReport, otherIndex);
            }
          }
        });
      };

      findNeighbors(report, index);
      clusters.push(cluster);
    });

    return clusters;
  };

  // Accurate distance calculation in meters using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getClusterIcon = (cluster) => {
    const size = Math.min(30 + (cluster.reports.length * 5), 60);
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${cluster.color}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 3px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-weight: bold; 
          font-size: ${size > 40 ? '14px' : '12px'}; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">
          ${cluster.reports.length}
        </div>
      `,
      className: 'cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Function to navigate to reports assessment
  const viewReportsAssessment = () => {
    window.location.href = '/reports-assessment';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reports...</span>
        </div>
        <p className="ms-3">Loading waste reports...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Simple Green Header */}
      <div className="bg-success text-white py-2 px-3" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <h5 className="mb-0">Report Clusters</h5>
        <small>{dataSource} • {clusters.length} clusters • {reports.length} reports</small>
      </div>

      {/* Full Screen Map - Centered on data location */}
      <MapContainer
        center={clusters.length > 0 ? clusters[0].center : currentLocation}
        zoom={12}
        style={{ width: "100%", height: "100%", marginTop: "50px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Show clusters */}
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.center}
            icon={getClusterIcon(cluster)}
          >
            <Popup>
              <div style={{ minWidth: "250px" }}>
                <h6 style={{ color: cluster.color, marginBottom: '10px' }}>
                  📍 {cluster.reports.length} Reports - {cluster.areaName}
                </h6>
                <p><strong>Location:</strong> 
                  <br />
                  <small>Lat: {cluster.center[0].toFixed(6)}</small>
                  <br />
                  <small>Lng: {cluster.center[1].toFixed(6)}</small>
                </p>
                <p><strong>Cluster Size:</strong> {cluster.reports.length} reports within 100m radius</p>
                <div className="mt-3">
                  <button 
                    className="btn btn-success btn-sm w-100 mb-2"
                    onClick={viewReportsAssessment}
                  >
                    📋 View All Reports
                  </button>
                  <button className="btn btn-primary btn-sm w-100">
                    🚚 Plan Collection Route
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Improved Legend with Automatic Area Names */}
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxWidth: '200px'
      }}>
        <h6 style={{ marginBottom: '8px', color: '#2d5a3c', fontSize: '14px' }}>🗺️ Report Clusters</h6>
        {clusters.map((cluster, index) => (
          <div key={cluster.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: cluster.color, 
              borderRadius: '50%', 
              marginRight: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: 'bold' 
            }}>
              {cluster.reports.length}
            </div>
            <span style={{ fontSize: '12px' }}>
              {cluster.areaName}
            </span>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: '#666', margin: 0, marginTop: '5px' }}>
          Data: {dataSource}
        </p>
      </div>

      {/* View Reports Button */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
        <button 
          className="btn btn-success btn-lg shadow"
          onClick={viewReportsAssessment}
        >
          📋 View All Reports ({reports.length})
        </button>
      </div>
    </div>
  );
};

export default MapView;