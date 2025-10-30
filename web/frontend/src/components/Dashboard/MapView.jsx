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
        report.location?.latitude && report.location?.longitude
      );
      
      setReports(reportsWithLocation);
      
      // Create clusters
      const clustered = createClusters(reportsWithLocation);
      setClusters(clustered);

      // DEBUG: Check what's happening
      console.log("=== CLUSTERING DEBUG ===");
      console.log("Total reports with location:", reportsWithLocation.length);
      console.log("Clusters created:", clustered.length);
      clustered.forEach((cluster, index) => {
        console.log(`Cluster ${index + 1}:`, cluster.reports.length, "reports at", cluster.center);
      });
      console.log("=== END DEBUG ===");
    }
  } catch (error) {
    console.error("Error loading reports:", error);
  } finally {
    setLoading(false);
  }
};

  // Smart clustering to group nearby reports
  const createClusters = (reports, maxDistance = 0.002) => {
    const clusters = [];
    const usedReports = new Set();
    
    reports.forEach((report, index) => {
      if (usedReports.has(index)) return;
      
      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        reports: [report],
        center: [report.location.latitude, report.location.longitude],
        urgency: 'pending' // Default until official assessment
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
    const size = Math.min(30 + (cluster.reports.length * 3), 50);
    
    return L.divIcon({
      html: `
        <div style="
          background-color: #2d5a3c; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 3px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-weight: bold; 
          font-size: 12px; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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
                  📍 {cluster.reports.length} Reports
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
        backgroundColor: '#2d5a3c', 
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
        {index === 0 ? 'Main Area' : 'Other Locations'}
      </span>
    </div>
  ))}
  <p style={{ fontSize: '11px', color: '#666', margin: 0, marginTop: '5px' }}>
    {clusters.length} areas need attention
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
  onClick={() => window.location.href = '/reports-assessment'}
>
  📋 View All Reports ({reports.length})
</button>
      </div>
    </div>
  );
};

export default MapView;