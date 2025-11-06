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
  const [debugInfo, setDebugInfo] = useState("");

  const nairobiCenter = [-1.2921, 36.8219];

  useEffect(() => {
    loadRealReports();
  }, []);

  const loadRealReports = async () => {
    try {
      setLoading(true);
      setDebugInfo("Starting to load reports from API...");
      
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      setDebugInfo(prev => prev + `\nAPI Response Status: ${response.status}`);
      setDebugInfo(prev => prev + `\nAPI Success: ${result.success}`);
      
      if (response.ok && result.success) {
        setDebugInfo(prev => prev + `\nTotal reports from API: ${result.reports?.length || 0}`);
        
        const reportsWithLocation = result.reports.filter(report => {
          const hasLocation = report.location?.latitude && report.location?.longitude;
          if (!hasLocation) {
            setDebugInfo(prev => prev + `\nReport missing location: ${report._id}`);
          }
          return hasLocation;
        });
        
        setDebugInfo(prev => prev + `\nReports with valid location: ${reportsWithLocation.length}`);
        
        setReports(reportsWithLocation);
        
        // Create clusters with 100m distance
        const clustered = createClusters(reportsWithLocation);
        setDebugInfo(prev => prev + `\nClusters created: ${clustered.length}`);
        
        setClusters(clustered);

        // Detailed debug info
        console.log("=== REAL DATA CLUSTERING DEBUG ===");
        console.log("API Response:", result);
        console.log("Total reports:", result.reports?.length);
        console.log("Reports with location:", reportsWithLocation.length);
        console.log("Clusters created:", clustered.length);
        
        clustered.forEach((cluster, index) => {
          console.log(`Cluster ${index + 1}:`, {
            reports: cluster.reports.length,
            center: cluster.center,
            reportsData: cluster.reports.map(r => ({
              id: r._id,
              location: r.location,
              description: r.description
            }))
          });
        });
        
      } else {
        setDebugInfo(prev => prev + `\nAPI Error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      setDebugInfo(prev => prev + `\nFetch Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Improved clustering with 100m distance (approximately 0.001 in coordinate degrees)
  const createClusters = (reports, maxDistance = 0.001) => {
    if (!reports || reports.length === 0) {
      setDebugInfo(prev => prev + "\nNo reports to cluster");
      return [];
    }

    const clusters = [];
    const usedReports = new Set();
    
    console.log("Starting clustering with", reports.length, "reports");
    
    reports.forEach((report, index) => {
      if (usedReports.has(index)) return;
      
      const cluster = {
        id: `cluster-${clusters.length + 1}`,
        reports: [report],
        center: [report.location.latitude, report.location.longitude],
        color: getClusterColor(clusters.length)
      };
      
      usedReports.add(index);
      
      // Find nearby reports within 100m
      reports.forEach((otherReport, otherIndex) => {
        if (!usedReports.has(otherIndex) && index !== otherIndex) {
          const distance = getDistance(
            report.location.latitude, report.location.longitude,
            otherReport.location.latitude, otherReport.location.longitude
          );
          
          if (distance <= maxDistance) {
            cluster.reports.push(otherReport);
            usedReports.add(otherIndex);
            
            // Update cluster center to average position
            cluster.center = [
              cluster.reports.reduce((sum, r) => sum + r.location.latitude, 0) / cluster.reports.length,
              cluster.reports.reduce((sum, r) => sum + r.location.longitude, 0) / cluster.reports.length
            ];
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    console.log("Clustering completed. Total clusters:", clusters.length);
    return clusters;
  };

  // Get different colors for different clusters
  const getClusterColor = (index) => {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    return colors[index % colors.length];
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    // Simple Euclidean distance for clustering (good enough for 100m range)
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  const getClusterIcon = (cluster) => {
    const size = Math.min(30 + (cluster.reports.length * 8), 70);
    
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
        <p className="ms-3">Loading real waste reports...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Debug Info Panel - Remove this in production */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 1000,
        maxWidth: '300px',
        fontSize: '12px',
        maxHeight: '200px',
        overflow: 'auto',
        border: '2px solid red'
      }}>
        <strong>Debug Info:</strong>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{debugInfo}</pre>
      </div>

      {/* Header */}
      <div className="bg-success text-white py-2 px-3" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <h5 className="mb-0">🗺️ Waste Clusters Map</h5>
        <small>Real Data: {clusters.length} clusters from {reports.length} reports</small>
      </div>

      {/* Map */}
      <MapContainer
        center={nairobiCenter}
        zoom={12}
        style={{ width: "100%", height: "100%", marginTop: "60px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Show individual reports as small markers */}
        {reports.map((report) => (
          <Marker
            key={report._id || report.id}
            position={[report.location.latitude, report.location.longitude]}
            icon={L.divIcon({
              html: `<div style="background-color: #95a5a6; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>`,
              className: 'individual-marker',
              iconSize: [8, 8],
              iconAnchor: [4, 4]
            })}
          >
            <Popup>
              <div>
                <strong>Individual Report</strong>
                <p>{report.description || 'No description'}</p>
                <small>Lat: {report.location.latitude.toFixed(4)}</small>
                <br />
                <small>Lng: {report.location.longitude.toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Show clusters as larger colored markers */}
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.center}
            icon={getClusterIcon(cluster)}
          >
            <Popup>
              <div style={{ minWidth: "250px" }}>
                <h6 style={{ color: cluster.color, marginBottom: '10px' }}>
                  📍 Cluster - {cluster.reports.length} Reports
                </h6>
                <p><strong>Center Location:</strong> 
                  <br />
                  <small>Lat: {cluster.center[0].toFixed(6)}</small>
                  <br />
                  <small>Lng: {cluster.center[1].toFixed(6)}</small>
                </p>
                <p><strong>Reports in this cluster:</strong></p>
                <ul style={{ fontSize: '12px', maxHeight: '100px', overflow: 'auto' }}>
                  {cluster.reports.map((report, idx) => (
                    <li key={idx}>{report.description || `Report ${idx + 1}`}</li>
                  ))}
                </ul>
                <button className="btn btn-success btn-sm w-100 mt-2">
                  🚚 Plan Collection
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '10px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000
      }}>
        <h6 style={{ marginBottom: '10px', color: '#2d5a3c' }}>Clusters Legend</h6>
        {clusters.map((cluster, index) => (
          <div key={cluster.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
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
            <span style={{ fontSize: '12px' }}>Cluster {index + 1}</span>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: '#666', margin: 0, marginTop: '5px' }}>
          {clusters.length} clusters • {reports.length} reports
        </p>
      </div>
    </div>
  );
};

export default MapView;