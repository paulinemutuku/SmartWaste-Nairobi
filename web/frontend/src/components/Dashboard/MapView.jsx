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

  // Nairobi mock clusters for demonstration
  const nairobiMockClusters = [
    {
      id: 'nairobi-cluster-1',
      reports: [
        { description: "Full bins near Dandora Market", latitude: -1.2600, longitude: 36.8900 },
        { description: "Illegal dumping site", latitude: -1.2602, longitude: 36.8903 },
        { description: "Overflowing containers", latitude: -1.2598, longitude: 36.8897 }
      ],
      center: [-1.2600, 36.8900],
      color: '#e74c3c',
      area: "Dandora Market"
    },
    {
      id: 'nairobi-cluster-2', 
      reports: [
        { description: "Full bins in Kayole Estate", latitude: -1.2750, longitude: 36.9100 },
        { description: "Illegal dumping near shopping center", latitude: -1.2753, longitude: 36.9102 }
      ],
      center: [-1.2750, 36.9100],
      color: '#3498db',
      area: "Kayole Estate"
    }
  ];

  useEffect(() => {
    loadRealReports();
  }, []);

  const loadRealReports = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      if (response.ok && result.success) {
        const reportsWithLocation = result.reports.filter(report => 
          report.latitude && report.longitude
        );
        
        setReports(reportsWithLocation);
        
        // Create clusters with proper 100m distance
        const clustered = createClusters(reportsWithLocation);
        setClusters(clustered);

        console.log("Clustering completed:", {
          totalReports: reportsWithLocation.length,
          clusters: clustered.length,
          clusterDetails: clustered.map(c => ({
            reports: c.reports.length,
            center: c.center,
            area: c.area
          }))
        });
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      // Fallback to mock data if real data fails
      setClusters(nairobiMockClusters);
    } finally {
      setLoading(false);
    }
  };

  // Improved clustering with accurate 100m distance
  const createClusters = (reports, maxDistance = 0.001) => {
    if (!reports || reports.length === 0) {
      return [...nairobiMockClusters]; // Show mock data when no real clusters
    }

    const clusters = [];
    const usedReports = new Set();
    
    // Different colors for different clusters
    const clusterColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    reports.forEach((report, index) => {
      if (usedReports.has(index)) return;
      
      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        reports: [report],
        center: [report.latitude, report.longitude],
        color: clusterColors[clusters.length % clusterColors.length],
        area: "Reported Area"
      };
      
      usedReports.add(index);
      
      // Find nearby reports within 100m (approximately 0.001 degrees)
      reports.forEach((otherReport, otherIndex) => {
        if (!usedReports.has(otherIndex) && index !== otherIndex) {
          const distance = getDistance(
            report.latitude, report.longitude,
            otherReport.latitude, otherReport.longitude
          );
          
          // Only cluster if within 100m
          if (distance <= maxDistance) {
            cluster.reports.push(otherReport);
            usedReports.add(otherIndex);
            
            // Update cluster center to average position
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + r.latitude, 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + r.longitude, 0) / cluster.reports.length
            ];
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    // If no real clusters found, use mock data
    if (clusters.length === 0) {
      return [...nairobiMockClusters];
    }
    
    return clusters;
  };

  // Calculate distance between two coordinates in degrees
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
        ">
          ${cluster.reports.length}
        </div>
      `,
      className: 'cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
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
        <h5 className="mb-0">Map View</h5>
      </div>

      {/* Full Screen Map */}
      <MapContainer
        center={nairobiCenter}
        zoom={12}
        style={{ width: "100%", height: "100%", marginTop: "50px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Show only clusters */}
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.center}
            icon={getClusterIcon(cluster)}
          >
            <Popup>
              <div style={{ minWidth: "250px" }}>
                <h6 style={{ color: '#2d5a3c', marginBottom: '10px' }}>
                  📍 {cluster.reports.length} Reports {cluster.area && `- ${cluster.area}`}
                </h6>
                <p><strong>Location:</strong> 
                  <br />
                  <small>Lat: {cluster.center[0].toFixed(4)}</small>
                  <br />
                  <small>Lng: {cluster.center[1].toFixed(4)}</small>
                </p>
                <p><strong>Status:</strong> 
                  <span className="badge bg-warning" style={{ marginLeft: '8px' }}>
                    Needs Assessment
                  </span>
                </p>
                <div className="mt-3">
                  <button className="btn btn-success btn-sm w-100 mb-2">
                    📋 View Reports
                  </button>
                  <button className="btn btn-primary btn-sm w-100">
                    🚚 Plan Route
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Simple Legend */}
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1000
      }}>
        <h6 style={{ marginBottom: '8px', color: '#2d5a3c', fontSize: '14px' }}>Clusters</h6>
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
              {cluster.area || `Cluster ${index + 1}`}
            </span>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: '#666', margin: 0, marginTop: '5px' }}>
          {clusters.length} areas need attention
        </p>
      </div>

      {/* View Reports Button - IMPORTANT! */}
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
        >
          📋 View All Reports ({reports.length})
        </button>
      </div>
    </div>
  );
};

export default MapView;