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

  const nairobiCenter = [-1.2921, 36.8219];

  // Nairobi mock data for Dandora and Kayole
  const nairobiMockData = [
    // Dandora Area Clusters
    { location: { latitude: -1.2600, longitude: 36.8900 }, description: "Full bins near Dandora Market", priority: "high" },
    { location: { latitude: -1.2620, longitude: 36.8920 }, description: "Illegal dumping site", priority: "high" },
    { location: { latitude: -1.2580, longitude: 36.8880 }, description: "Overflowing containers", priority: "medium" },
    { location: { latitude: -1.2630, longitude: 36.8950 }, description: "Waste accumulation near school", priority: "high" },
    { location: { latitude: -1.2570, longitude: 36.8910 }, description: "Street blockage due to waste", priority: "medium" },
    
    // Kayole Area Clusters  
    { location: { latitude: -1.2750, longitude: 36.9100 }, description: "Full bins in Kayole Estate", priority: "medium" },
    { location: { latitude: -1.2770, longitude: 36.9120 }, description: "Illegal dumping near shopping center", priority: "high" },
    { location: { latitude: -1.2730, longitude: 36.9080 }, description: "Waste in drainage system", priority: "medium" },
    { location: { latitude: -1.2780, longitude: 36.9150 }, description: "Abandoned waste site", priority: "low" },
    { location: { latitude: -1.2720, longitude: 36.9060 }, description: "Community waste collection point full", priority: "medium" },
    
    // Additional clusters to show different colors
    { location: { latitude: -1.2850, longitude: 36.8700 }, description: "Industrial area waste", priority: "high" },
    { location: { latitude: -1.2880, longitude: 36.8720 }, description: "Construction waste", priority: "medium" },
    { location: { latitude: -1.2400, longitude: 36.8500 }, description: "Residential area overflow", priority: "low" },
    { location: { latitude: -1.2450, longitude: 36.8550 }, description: "Market waste after weekend", priority: "high" }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Try to load real data first, fallback to mock data
      let reportsData = [];
      try {
        const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
        const result = await response.json();
        
        if (response.ok && result.success) {
          reportsData = result.reports.filter(report => 
            report.location?.latitude && report.location?.longitude
          );
        }
      } catch (error) {
        console.log("Using mock data for development");
        reportsData = nairobiMockData;
      }

      // If no real data, use mock data
      if (reportsData.length === 0) {
        reportsData = nairobiMockData;
      }
      
      setReports(reportsData);
      
      // Create clusters with improved algorithm
      const clustered = createClusters(reportsData);
      setClusters(clustered);

      // DEBUG: Check what's happening
      console.log("=== NAIROBI CLUSTERING DEBUG ===");
      console.log("Total reports with location:", reportsData.length);
      console.log("Clusters created:", clustered.length);
      clustered.forEach((cluster, index) => {
        console.log(`Cluster ${index + 1}:`, cluster.reports.length, "reports at", cluster.center, "Color:", cluster.color);
      });
      console.log("=== END DEBUG ===");
    } catch (error) {
      console.error("Error loading reports:", error);
      // Fallback to mock data on error
      setReports(nairobiMockData);
      setClusters(createClusters(nairobiMockData));
    } finally {
      setLoading(false);
    }
  };

  // Improved clustering algorithm with different colors
  const createClusters = (reports, maxDistance = 0.003) => {
    const clusters = [];
    const usedReports = new Set();
    
    // Different colors for different clusters
    const clusterColors = [
      '#e74c3c', // Red - High priority areas
      '#f39c12', // Orange - Medium priority
      '#2ecc71', // Green - Low priority
      '#9b59b6', // Purple
      '#34495e', // Dark blue
      '#1abc9c', // Teal
      '#d35400', // Dark orange
      '#27ae60'  // Dark green
    ];
    
    reports.forEach((report, index) => {
      if (usedReports.has(index)) return;
      
      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        reports: [report],
        center: [report.location.latitude, report.location.longitude],
        color: clusterColors[clusters.length % clusterColors.length], // Assign different colors
        priority: report.priority || 'medium'
      };
      
      usedReports.add(index);
      
      // Find nearby reports to cluster
      reports.forEach((otherReport, otherIndex) => {
        if (!usedReports.has(otherIndex) && index !== otherIndex) {
          const distance = getDistance(
            report.location.latitude, report.location.longitude,
            otherReport.location.latitude, otherReport.location.longitude
          );
          
          if (distance <= maxDistance) {
            cluster.reports.push(otherReport);
            usedReports.add(otherIndex);
            
            // Update cluster center (average position)
            cluster.center = [
              (cluster.center[0] + otherReport.location.latitude) / 2,
              (cluster.center[1] + otherReport.location.longitude) / 2
            ];
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
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
          cursor: pointer;
        ">
          ${cluster.reports.length}
        </div>
      `,
      className: 'cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const getAreaName = (cluster) => {
    const lat = cluster.center[0];
    const lng = cluster.center[1];
    
    // Determine area based on coordinates
    if (lat > -1.265 && lng > 36.885) return "Dandora Area";
    if (lat > -1.280 && lng > 36.905) return "Kayole Area";
    if (lat > -1.285 && lng > 36.865) return "Industrial Zone";
    return "Nairobi Area";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reports...</span>
        </div>
        <p className="ms-3">Loading Nairobi waste reports...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Simple Green Header */}
      <div className="bg-success text-white py-2 px-3" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <h5 className="mb-0">🗺️ Nairobi Waste Clusters Map</h5>
        <small>Showing {clusters.length} waste clusters across Nairobi</small>
      </div>

      {/* Full Screen Map */}
      <MapContainer
        center={nairobiCenter}
        zoom={12}
        style={{ width: "100%", height: "100%", marginTop: "60px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Show clusters with different colors */}
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.center}
            icon={getClusterIcon(cluster)}
          >
            <Popup>
              <div style={{ minWidth: "280px" }}>
                <h6 style={{ color: cluster.color, marginBottom: '10px', borderBottom: `2px solid ${cluster.color}`, paddingBottom: '5px' }}>
                  📍 {getAreaName(cluster)} - {cluster.reports.length} Reports
                </h6>
                <p><strong>Location:</strong> 
                  <br />
                  <small>Lat: {cluster.center[0].toFixed(4)}</small>
                  <br />
                  <small>Lng: {cluster.center[1].toFixed(4)}</small>
                </p>
                <p><strong>Priority:</strong> 
                  <span className={`badge ${cluster.priority === 'high' ? 'bg-danger' : cluster.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} style={{ marginLeft: '8px' }}>
                    {cluster.priority.toUpperCase()}
                  </span>
                </p>
                <div className="mt-3">
                  <button className="btn btn-success btn-sm w-100 mb-2">
                    📋 View {cluster.reports.length} Reports
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

      {/* Enhanced Legend */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '10px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxWidth: '200px'
      }}>
        <h6 style={{ marginBottom: '12px', color: '#2d5a3c', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          🗺️ Nairobi Waste Clusters
        </h6>
        {clusters.slice(0, 6).map((cluster, index) => (
          <div key={cluster.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ 
        width: '20px', 
        height: '20px', 
        backgroundColor: cluster.color, 
        borderRadius: '50%', 
        marginRight: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white', 
        fontSize: '10px', 
        fontWeight: 'bold',
        border: '2px solid white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}>
              {cluster.reports.length}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>
              {getAreaName(cluster)}
            </span>
          </div>
        ))}
        {clusters.length > 6 && (
          <p style={{ fontSize: '11px', color: '#666', margin: 0, marginTop: '5px', fontStyle: 'italic' }}>
            +{clusters.length - 6} more clusters...
          </p>
        )}
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '11px', color: '#2d5a3c', margin: 0, fontWeight: 'bold' }}>
            {clusters.length} clusters • {reports.length} total reports
          </p>
        </div>
      </div>

      {/* Enhanced View Reports Button */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
        <button 
          className="btn btn-success btn-lg shadow"
          onClick={() => window.location.href = '/reports-assessment'}
          style={{ 
            background: 'linear-gradient(135deg, #2d5a3c, #3a7350)',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📋 View All Reports ({reports.length})
        </button>
      </div>
    </div>
  );
};

export default MapView;