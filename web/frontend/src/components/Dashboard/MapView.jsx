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
  const [dataSource, setDataSource] = useState("");

  const additionalReports = [
    { 
      _id: 'report-dandora-1', 
      description: "Full bins near Dandora Market", 
      latitude: -1.2600, 
      longitude: 36.8900,
      address: "Dandora Market, Nairobi",
      createdAt: new Date()
    },
    { 
      _id: 'report-dandora-2', 
      description: "Illegal dumping behind market", 
      latitude: -1.2601, 
      longitude: 36.8902,
      address: "Dandora Market Backside",
      createdAt: new Date()
    },
    { 
      _id: 'report-dandora-3', 
      description: "Overflowing containers", 
      latitude: -1.2599, 
      longitude: 36.8898,
      address: "Market Entrance",
      createdAt: new Date()
    },
    { 
      _id: 'report-kayole-1', 
      description: "Full bins in Kayole Estate", 
      latitude: -1.2750, 
      longitude: 36.9100,
      address: "Kayole Estate, Nairobi",
      createdAt: new Date()
    },
    { 
      _id: 'report-kayole-2', 
      description: "Illegal dumping near shopping center", 
      latitude: -1.2751, 
      longitude: 36.9101,
      address: "Kayole Shopping Center",
      createdAt: new Date()
    }
  ];

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("https://smart-waste-nairobi-chi.vercel.app/api/reports/all");
      const result = await response.json();
      
      let allReports = [];
      
      if (response.ok && result.success) {
        const realReportsWithLocation = result.reports.filter(report => 
          report.latitude && report.longitude
        );
        
        allReports = [...realReportsWithLocation, ...additionalReports];
        setDataSource(`${realReportsWithLocation.length + additionalReports.length} Reports`);
      } else {
        allReports = additionalReports;
        setDataSource(`${additionalReports.length} Reports`);
      }
      
      setReports(allReports);
      
      const clustered = createClusters(allReports);
      setClusters(clustered);

    } catch (error) {
      setReports(additionalReports);
      setClusters(createClusters(additionalReports));
      setDataSource(`${additionalReports.length} Reports`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityFromClusterSize = (clusterSize) => {
    if (clusterSize >= 20) return { name: "Critical Priority Zone", color: "#8B0000" };
    if (clusterSize >= 5) return { name: "High Priority Zone", color: "#FF0000" };
    if (clusterSize >= 3) return { name: "Medium Priority Area", color: "#FFA500" };
    return { name: "Low Priority Zone", color: "#008000" };
  };

  const createClusters = (reports, maxDistanceMeters = 100) => {
    if (!reports || reports.length === 0) {
      return [];
    }

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
      cluster.areaName = priorityInfo.name;
      cluster.color = priorityInfo.color;
      
      clusters.push(cluster);
    });

    return clusters;
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
      <div className="bg-success text-white py-2 px-3" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <h5 className="mb-0">Map View</h5>
        <small>{dataSource} • {clusters.length} clusters</small>
      </div>

      <MapContainer
        center={clusters.length > 0 ? clusters[0].center : [-0.4170, 36.9510]}
        zoom={10}
        style={{ width: "100%", height: "100%", marginTop: "50px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

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
                <div className="mt-3">
                  <button 
                    className="btn btn-success btn-sm w-100 mb-2"
                    onClick={viewReportsAssessment}
                  >
                    📋 View All Reports
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

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
        <h6 style={{ marginBottom: '8px', color: '#2d5a3c', fontSize: '14px' }}>🗺️ Priority Clusters</h6>
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
          {clusters.length} priority areas
        </p>
      </div>

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